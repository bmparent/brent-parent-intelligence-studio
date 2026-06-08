interface Env {
  CONTACT_WEBHOOK_URL?: string;
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

type InquiryPayload = {
  projectType?: string;
  problem?: string;
  currentUrl?: string;
  tools?: string;
  inspiration?: string;
  timeline?: string;
  budget?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  website?: string;
  brief?: string;
};

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

const MAX_REQUEST_BYTES = 12000;
const DEFAULT_CONTACT_EMAIL = '1brent.bm@gmail.com';

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
    `Project type: ${clean(payload.projectType, 120) || 'Not provided'}`,
    `Problem to solve: ${clean(payload.problem, 1600) || 'Not provided'}`,
    `Current website/storefront URL: ${clean(payload.currentUrl, 260) || 'Not provided'}`,
    `Tools involved: ${clean(payload.tools, 400) || 'Not provided'}`,
    `Examples or inspiration: ${clean(payload.inspiration, 800) || 'Not provided'}`,
    `Timeline: ${clean(payload.timeline, 120) || 'Not provided'}`,
    `Budget posture: ${clean(payload.budget, 120) || 'Not provided'}`,
    '',
    `Name: ${clean(payload.name, 160) || 'Not provided'}`,
    `Company / organization: ${clean(payload.company, 180) || 'Not provided'}`,
    `Email: ${clean(payload.email, 260) || 'Not provided'}`,
    `Phone: ${clean(payload.phone, 80) || 'Not provided'}`,
    `Preferred contact method: ${clean(payload.preferredContact, 120) || 'Not provided'}`
  ].join('\n');
}

function validate(payload: InquiryPayload) {
  const errors: Record<string, string> = {};
  const problem = clean(payload.problem, 1600);
  const projectType = clean(payload.projectType, 120);
  const name = clean(payload.name, 160);
  const email = clean(payload.email, 260);
  const brief = clean(payload.brief, 5000);

  if (!projectType) errors.projectType = 'Project type is required.';
  if (problem.length < 20) errors.problem = 'Describe the problem in at least 20 characters.';
  if (brief.length < 20) errors.brief = 'A generated brief or message is required.';
  if (!name) errors.name = 'Name is required.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'A valid email is required.';

  return errors;
}

function mailto(contactEmail: string, brief: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent('Eidos Works project inquiry')}&body=${encodeURIComponent(brief)}`;
}

async function sendWebhook(url: string, payload: InquiryPayload, brief: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: 'eidos-works-site', payload, brief })
  });

  return response.ok;
}

async function sendResendEmail(env: Env, payload: InquiryPayload, brief: string, contactEmail: string) {
  if (!env.RESEND_API_KEY) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL || 'Eidos Works <onboarding@resend.dev>',
      to: [contactEmail],
      reply_to: clean(payload.email, 260),
      subject: 'Eidos Works project inquiry',
      text: brief
    })
  });

  return response.ok;
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
  let payload: InquiryPayload;

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json(
      {
        state: 'validation_error',
        submitted: false,
        message: 'Request body is too large.',
        errors: { request: 'Request body is too large.' }
      },
      { status: 413 }
    );
  }

  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return json({ state: 'validation_error', submitted: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const contactEmail = clean(env.CONTACT_EMAIL, 260) || DEFAULT_CONTACT_EMAIL;
  const brief = buildBrief(payload);
  const fallbackMailto = mailto(contactEmail, brief);

  if (clean(payload.website, 120)) {
    return json({
      state: 'fallback',
      submitted: false,
      message: 'Your brief is ready. Email it to Eidos Works.',
      brief,
      mailto: fallbackMailto
    });
  }

  const errors = validate(payload);
  if (Object.keys(errors).length) {
    return json(
      {
        state: 'validation_error',
        submitted: false,
        message: 'Please complete the required fields.',
        errors,
        brief,
        mailto: fallbackMailto
      },
      { status: 400 }
    );
  }

  try {
    const hasResend = Boolean(env.RESEND_API_KEY);
    const hasWebhook = Boolean(env.CONTACT_WEBHOOK_URL);

    if (hasResend && (await sendResendEmail(env, payload, brief, contactEmail))) {
      return json({
        state: 'sent',
        submitted: true,
        message: 'Your brief was submitted to Eidos Works.',
        brief,
        mailto: fallbackMailto
      });
    }

    if (hasWebhook && env.CONTACT_WEBHOOK_URL && (await sendWebhook(env.CONTACT_WEBHOOK_URL, payload, brief))) {
      return json({
        state: 'sent',
        submitted: true,
        message: 'Your brief was submitted to Eidos Works.',
        brief,
        mailto: fallbackMailto
      });
    }

    if (hasResend || hasWebhook) {
      return json(
        {
          state: 'provider_error',
          submitted: false,
          message: 'The delivery provider could not send this brief. Email it to Eidos Works.',
          brief,
          mailto: fallbackMailto
        },
        { status: 502 }
      );
    }
  } catch {
    return json(
      {
        state: 'provider_error',
        submitted: false,
        message: 'The delivery provider could not send this brief. Email it to Eidos Works.',
        brief,
        mailto: fallbackMailto
      },
      { status: 502 }
    );
  }

  return json({
    state: 'fallback',
    submitted: false,
    message: 'Your brief is ready. Email it to Eidos Works.',
    brief,
    mailto: fallbackMailto
  });
};
