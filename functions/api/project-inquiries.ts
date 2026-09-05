import { isRecord, readJsonBody, RequestBodyError } from '../_shared/snapshot/http';

interface Env {
  EIDOS_INQUIRY_MAILER?: { fetch: typeof fetch };
  CONTACT_WEBHOOK_URL?: string;
  GOOGLE_APPS_SCRIPT_WEBHOOK_URL?: string;
  COMMAND_CENTER_SHARED_SECRET?: string;
  PUBLIC_PROJECTS_EMAIL?: string;
  NOTIFICATION_TO_EMAIL?: string;
}

type PagesContext = { request: Request; env: Env };

type InquiryPayload = {
  projectType?: string;
  problem?: string;
  currentUrl?: string;
  name?: string;
  company?: string;
  email?: string;
  website?: string;
  brief?: string;
};

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
};

const MAX_REQUEST_BYTES = 12_000;
const DEFAULT_PROJECTS_EMAIL = 'projects@eidos-works.com';

function json(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers ?? {}) }
  });
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function buildBrief(payload: InquiryPayload) {
  return [
    'Eidos Works project inquiry',
    '',
    `Service: ${clean(payload.projectType, 120) || 'Not provided'}`,
    `Problem to solve: ${clean(payload.problem, 1_600) || 'Not provided'}`,
    `Current website: ${clean(payload.currentUrl, 260) || 'Not provided'}`,
    '',
    `Name: ${clean(payload.name, 160) || 'Not provided'}`,
    `Company / organization: ${clean(payload.company, 180) || 'Not provided'}`,
    `Email: ${clean(payload.email, 260) || 'Not provided'}`
  ].join('\n');
}

function validate(payload: InquiryPayload) {
  const errors: Record<string, string> = {};
  const problem = clean(payload.problem, 1_600);
  const projectType = clean(payload.projectType, 120);
  const name = clean(payload.name, 160);
  const email = clean(payload.email, 260);

  if (!projectType) errors.projectType = 'Choose the kind of help you need.';
  if (problem.length < 20) errors.problem = 'Describe the problem in at least 20 characters.';
  if (!name) errors.name = 'Name is required.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'A valid email is required.';
  return errors;
}

function mailto(contactEmail: string, brief: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent('Eidos Works Project Inquiry')}&body=${encodeURIComponent(brief)}`;
}

async function sendWebhook(url: string, payload: InquiryPayload, sharedSecret?: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        sharedSecret: sharedSecret || undefined,
        eventType: 'lead',
        data: {
          createdDate: new Date().toISOString(),
          name: clean(payload.name, 160),
          email: clean(payload.email, 260),
          company: clean(payload.company, 180),
          website: clean(payload.currentUrl, 260),
          source: 'eidos-works-site',
          serviceInterest: clean(payload.projectType, 120),
          notes: clean(payload.problem, 1_600)
        }
      })
    });
    if (!response.ok) return false;
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return result?.ok === true;
  } finally {
    clearTimeout(timeout);
  }
}

export const onRequestOptions = () =>
  new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ state: 'validation_error', submitted: false, message: 'Submit this form from Eidos Works.' }, { status: 403 });
  }
  let payload: InquiryPayload;
  try {
    const body = await readJsonBody(request, MAX_REQUEST_BYTES);
    if (!isRecord(body)) {
      return json({ state: 'validation_error', submitted: false, message: 'Invalid form submission.' }, { status: 400 });
    }
    payload = body as InquiryPayload;
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return json(
        { state: 'validation_error', submitted: false, message: error.publicMessage },
        { status: error.status }
      );
    }
    return json({ state: 'validation_error', submitted: false, message: 'Invalid form submission.' }, { status: 400 });
  }

  const contactEmail = clean(env.PUBLIC_PROJECTS_EMAIL, 260) || clean(env.NOTIFICATION_TO_EMAIL, 260) || DEFAULT_PROJECTS_EMAIL;
  const brief = buildBrief(payload);
  const fallbackMailto = mailto(contactEmail, brief);

  if (clean(payload.website, 120)) {
    return json({ state: 'fallback', submitted: false, message: 'Your note is ready to email.', brief, mailto: fallbackMailto });
  }

  const errors = validate(payload);
  if (Object.keys(errors).length) {
    return json(
      { state: 'validation_error', submitted: false, message: 'Please complete the required fields.', errors, brief, mailto: fallbackMailto },
      { status: 400 }
    );
  }

  if (env.EIDOS_INQUIRY_MAILER) {
    try {
      const response = await env.EIDOS_INQUIRY_MAILER.fetch('https://inquiry.internal/inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-eidos-inquiry-client': request.headers.get('cf-connecting-ip') || 'unknown' },
        body: JSON.stringify({ brief, email: clean(payload.email, 260) }),
        signal: AbortSignal.timeout(8_000),
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; receipt?: string } | null;
      if (response.ok && result?.ok === true && typeof result.receipt === 'string') {
        return json({ state: 'sent', submitted: true, message: 'Your project note reached Eidos Works.', receipt: result.receipt, brief, mailto: fallbackMailto });
      }
      return json({ state: 'provider_error', submitted: false, message: 'Delivery was unavailable. Email the prepared note directly.', brief, mailto: fallbackMailto }, { status: response.status === 429 ? 429 : 502 });
    } catch {
      return json({ state: 'provider_error', submitted: false, message: 'Delivery was unavailable. Email the prepared note directly.', brief, mailto: fallbackMailto }, { status: 502 });
    }
  }

  const webhookUrl = clean(env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL, 1_000) || clean(env.CONTACT_WEBHOOK_URL, 1_000);
  if (webhookUrl) {
    try {
      if (await sendWebhook(webhookUrl, payload, env.COMMAND_CENTER_SHARED_SECRET)) {
        return json({ state: 'sent', submitted: true, message: 'Your project note reached Eidos Works.', brief, mailto: fallbackMailto });
      }
      return json(
        { state: 'provider_error', submitted: false, message: 'Delivery was unavailable. Email the prepared note directly.', brief, mailto: fallbackMailto },
        { status: 502 }
      );
    } catch {
      return json(
        { state: 'provider_error', submitted: false, message: 'Delivery was unavailable. Email the prepared note directly.', brief, mailto: fallbackMailto },
        { status: 502 }
      );
    }
  }

  return json({
    state: 'fallback',
    submitted: false,
    message: 'Your note is ready. Send it directly to Eidos Works.',
    brief,
    mailto: fallbackMailto
  });
};
