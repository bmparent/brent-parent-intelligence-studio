import { confirmedInquiry, type GrowthEnv } from '../_shared/growth';
import { sanitizeAttribution } from '../../src/lib/growthContract';
import { isRecord, readJsonBody, RequestBodyError } from '../_shared/snapshot/http';
import { type Database } from '../_shared/platform/core';

interface Env extends GrowthEnv {
  EIDOS_INQUIRY_MAILER?: { fetch: typeof fetch };
  CONTACT_WEBHOOK_URL?: string;
  GOOGLE_APPS_SCRIPT_WEBHOOK_URL?: string;
  COMMAND_CENTER_SHARED_SECRET?: string;
  PUBLIC_PROJECTS_EMAIL?: string;
  NOTIFICATION_TO_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type PagesContext = { request: Request; env: Env };

type InquiryPayload = {
  challenge?: string;
  growth?: unknown;
  inquiryKind?: string;
  projectType?: string;
  problem?: string;
  desiredOutcome?: string;
  currentUrl?: string;
  supportingUrl?: string;
  foundVia?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
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
const INQUIRY_RUNTIME_RELEASE = 'm2-friction-2026-09-15-r1';

async function inquiryDigest(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))]
    .map(n => n.toString(16).padStart(2, '0')).join('');
}

async function verifyInquiry(request: Request, env: Env, token: unknown) {
  if (typeof token !== 'string' || token.length < 8 || token.length > 2048) return false;
  const hostname = new URL(request.url).hostname;
  if (!env.TURNSTILE_SECRET_KEY) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token,
      remoteip: request.headers.get('cf-connecting-ip') || undefined }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && result.hostname === hostname && result.action === 'inquiry';
}

async function reserveInquiry(request: Request, env: Env, email: string) {
  const database: Database | undefined = env.EIDOS_GROWTH_DB;
  const secret = env.EIDOS_PLATFORM_TOKEN;
  const ip = request.headers.get('cf-connecting-ip');
  if (!database || !secret || secret.length < 32 || !ip) return null;
  const hour = Math.floor(Date.now() / 3_600_000), day = Math.floor(Date.now() / 86_400_000);
  const visitor = await inquiryDigest(secret, `inquiry-ip:${day}:${ip}`);
  const address = await inquiryDigest(secret, `inquiry-email:${day}:${email.toLowerCase()}`);
  for (const [bucket, period, limit, expires] of [
    [`inquiry-ip:${visitor}`, hour, 5, hour * 60 + 120],
    [`inquiry-email:${address}`, day, 3, (day + 2) * 1440],
    ['inquiry-global', day, 100, (day + 2) * 1440],
  ] as const) {
    const row = await database.prepare(
      'INSERT INTO growth_quotas(bucket,period,used,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,period) DO UPDATE SET used=used+1 WHERE used<? RETURNING used',
    ).bind(bucket, period, expires, limit).first();
    if (!row) return false;
  }
  return true;
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isLabAccessRequest(payload: InquiryPayload) {
  return clean(payload.projectType, 120).startsWith('Eidos / Sentinel access');
}

function isFrictionReview(payload: InquiryPayload) {
  return clean(payload.inquiryKind, 80) === 'friction-review' || clean(payload.projectType, 120) === 'Friction Review';
}

function inquiryTitle(payload: InquiryPayload) {
  if (isLabAccessRequest(payload)) return 'Eidos Brain / Sentinel test-access request';
  if (isFrictionReview(payload)) return 'Eidos Works Friction Review request';
  return 'Eidos Works project inquiry';
}

function json(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers ?? {}) }
  });
}

function isQa(payload: InquiryPayload) {
  return /^Eidos Works QA\b/i.test(clean(payload.name, 160)) || Boolean(payload.growth && typeof payload.growth === 'object' && 'qa' in payload.growth && payload.growth.qa === true);
}
function attributionLines(payload: InquiryPayload) {
  const labels = { utmSource: 'utm_source', utmMedium: 'utm_medium', utmCampaign: 'utm_campaign', utmContent: 'utm_content', referrer: 'Referrer', landingPage: 'Landing page' };
  return Object.entries(sanitizeAttribution(payload)).map(([key,value]) => `${labels[key as keyof typeof labels]}: ${value || 'Not provided'}`);
}

function buildBrief(payload: InquiryPayload) {
  const common = [
    inquiryTitle(payload),
    ...(isQa(payload) ? ['Eidos Works QA - not a customer lead'] : []),
    '',
    `Service: ${clean(payload.projectType, 120) || 'Not provided'}`,
    `Name: ${clean(payload.name, 160) || 'Not provided'}`,
    `Email: ${clean(payload.email, 260) || 'Not provided'}`,
    `Company / organization: ${clean(payload.company, 180) || 'Not provided'}`,
    `Current website / relevant URL: ${clean(payload.currentUrl, 260) || 'Not provided'}`,
    `Found Eidos Works via: ${clean(payload.foundVia, 120) || 'Not provided'}`,
  ];

  if (isFrictionReview(payload)) {
    const frictionBrief = [
      ...common,
      'Attribution',
      ...attributionLines(payload),
      `Supporting link: ${clean(payload.supportingUrl, 500) || 'Not provided'}`,
      '',
      'Where is the friction?',
      clean(payload.problem, 1_600) || 'Not provided',
      '',
      'What would you rather happen?',
      clean(payload.desiredOutcome, 1_200) || 'Not provided',
      '',
    ].join('\n');
    return frictionBrief.slice(0, 4_900);
  }

  return [
    ...common,
    'Attribution',
    ...attributionLines(payload),
    '',
    `Problem to solve: ${clean(payload.problem, 1_600) || 'Not provided'}`,
  ].join('\n').slice(0, 4_900);
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

function mailto(contactEmail: string, brief: string, payload: InquiryPayload) {
  const subject = isLabAccessRequest(payload)
    ? 'Eidos Brain / Sentinel Test Access'
    : isFrictionReview(payload)
      ? 'Eidos Works Friction Review'
      : 'Eidos Works Project Inquiry';
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
}

function webhookNotes(payload: InquiryPayload) {
  if (!isFrictionReview(payload)) {
    return [
      ...attributionLines(payload),
      `Problem: ${clean(payload.problem, 1_600)}`,
      `Found via: ${clean(payload.foundVia, 120) || 'Not provided'}`,
    ].join('\n').slice(0, 1_900);
  }
  return [
    ...attributionLines(payload),
    `Friction: ${clean(payload.problem, 1_600)}`,
    `Desired outcome: ${clean(payload.desiredOutcome, 1_200) || 'Not provided'}`,
    `Supporting link: ${clean(payload.supportingUrl, 500) || 'Not provided'}`,
    `Found via: ${clean(payload.foundVia, 120) || 'Not provided'}`,
  ].join('\n').slice(0, 3_800);
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
          source: isFrictionReview(payload) ? 'eidos-works-friction-review' : 'eidos-works-site',
          serviceInterest: clean(payload.projectType, 120),
          notes: webhookNotes(payload)
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

export const onRequestGet = ({ env }: PagesContext) =>
  json({
    ok: true,
    service: 'project-inquiries',
    release: INQUIRY_RUNTIME_RELEASE,
    deliveryConfigured: Boolean(
      env.EIDOS_INQUIRY_MAILER || env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || env.CONTACT_WEBHOOK_URL
    ),
    privateMailerConfigured: Boolean(env.EIDOS_INQUIRY_MAILER),
  });

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
    payload = { ...body, ...sanitizeAttribution(body) } as InquiryPayload;
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
  const fallbackMailto = mailto(contactEmail, brief, payload);

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

  // Every delivery path (private mailer and webhook) passes the same checks.
  if (env.EIDOS_INQUIRY_MAILER || env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || env.CONTACT_WEBHOOK_URL) {
    try {
      if (!await verifyInquiry(request, env, payload.challenge))
        return json({ state: 'fallback', submitted: false, message: 'Verification expired. You can email the prepared note directly.', brief, mailto: fallbackMailto }, { status: 403 });
      const quota = await reserveInquiry(request, env, clean(payload.email, 260));
      if (quota !== true)
        return json({ state: 'fallback', submitted: false, message: quota === false ? 'Too many requests right now. You can email the prepared note directly.' : 'The form is temporarily unavailable. You can email the prepared note directly.', brief, mailto: fallbackMailto }, { status: quota === false ? 429 : 503 });
    } catch {
      return json({ state: 'fallback', submitted: false, message: 'The form is temporarily unavailable. You can email the prepared note directly.', brief, mailto: fallbackMailto }, { status: 503 });
    }
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
        const measurementRecorded = await confirmedInquiry(request, env, payload.growth, isFrictionReview(payload), isQa(payload), result.receipt);
        return json({ state: 'sent', submitted: true, message: isFrictionReview(payload) ? 'Your Friction Review request reached Eidos Works.' : 'Your project note reached Eidos Works.', receipt: result.receipt, measurementRecorded, brief, mailto: fallbackMailto });
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
        await confirmedInquiry(request, env, payload.growth, isFrictionReview(payload), isQa(payload), crypto.randomUUID());
        return json({ state: 'sent', submitted: true, message: isFrictionReview(payload) ? 'Your Friction Review request reached Eidos Works.' : 'Your project note reached Eidos Works.', brief, mailto: fallbackMailto });
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
