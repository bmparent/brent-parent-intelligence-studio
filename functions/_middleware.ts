import { body, HttpError, json, readText } from './_shared/platform/core';
import { hostDescriptor } from './_shared/platform/exchangeHost';

interface RelayContext {
  request: Request;
  env: { EIDOS_PLATFORM_URL?: string; EIDOS_PLATFORM_TOKEN?: string; EIDOS_PLATFORM_PREVIEW_BYPASS?: string; EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED?: string; EIDOS_EXCHANGE_HOST_ENABLED?: string };
  next(): Promise<Response>;
}
const routes = new Set([
  '/api/assistant', '/api/public-config',
  '/api/playground/projects', '/api/playground/checkout', '/api/playground/purchases', '/api/playground/webhook',
  '/api/members/auth', '/api/members/account', '/api/members/directory', '/api/members/unsubscribe',
  '/api/community/threads', '/api/community/replies', '/api/community/agents',
  '/api/community/agent-registration', '/api/community/agent-account',
  '/api/community/host', '/api/community/host-admin',
  '/api/community/moderate', '/api/community/maintenance',
  '/api/shop/checkout', '/api/shop/status', '/api/shop/download', '/api/shop/webhook',
  '/community/feed', '/community/sitemap.xml',
]);

/** Transport only. Research, model calls, storage and payment processing run in Sentinel. */
export async function onRequest({ request, env, next }: RelayContext) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (!routes.has(path) && !/^\/community\/thread\/[a-zA-Z0-9-]+$/.test(path)) return next();
  // Closed public entry points stay honest even when an older backend is unavailable.
  // Existing identity progress and credential revocation retain their relay path.
  if (path === '/api/community/host' && env.EIDOS_EXCHANGE_HOST_ENABLED !== 'true') {
    if (request.method === 'GET' && !request.headers.has('authorization')) return json(hostDescriptor({}));
    if (request.method !== 'GET') return json({ error: 'The resident host is not enabled at this site. Public instructions remain available.' }, 503);
  }
  if (env.EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED !== 'true') {
    if (path === '/api/community/agent-registration') {
      if (request.method === 'GET') return json({ enabled: false, verification: 'unclaimed', publication: 'manual-review',
        instructions: '/skill.md', briefing: '/agent-brief.json', message: 'Agent self-registration is not enabled at this site. Public reading remains available.' });
      if (request.method === 'POST') return json({ error: 'Agent self-registration is not enabled at this site.' }, 503);
      return json({ error: 'Method not supported.' }, 405);
    }
    if (path === '/api/community/agents' && request.method === 'POST' &&
      (request.headers.get('authorization') || '').startsWith('Bearer ew_exchange_'))
      return json({ error: 'New Exchange submissions are not enabled at this site.' }, 503);
    if (path === '/api/community/host' && request.method === 'POST') {
      try {
        if ((await body(request.clone(), 2500)).action === 'enroll') return json({ error: 'Agent self-registration is not enabled at this site.' }, 503);
      } catch (error) {
        return json({ error: error instanceof HttpError ? error.message : 'The request could not be read.' }, error instanceof HttpError ? error.status : 400);
      }
    }
  }
  if (!env.EIDOS_PLATFORM_URL) return next();
  try {
    const target = new URL(env.EIDOS_PLATFORM_URL);
    const local = ['localhost', '127.0.0.1'].includes(url.hostname) &&
      ['localhost', '127.0.0.1'].includes(target.hostname);
    if ((!local && (target.protocol !== 'https:' || !target.hostname.endsWith('.vercel.app'))) ||
      target.username || target.password || target.search || target.hash ||
      !env.EIDOS_PLATFORM_TOKEN || env.EIDOS_PLATFORM_TOKEN.length < 32) {
      throw new HttpError(503, 'The studio connection is being prepared.');
    }
    target.pathname = '/api/works/v1' + path;
    target.search = url.search;
    const headers = new Headers();
    for (const name of ['content-type', 'authorization', 'origin', 'stripe-signature', 'sec-fetch-site']) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const session = (request.headers.get('cookie') || '').split(';').map(s=>s.trim()).find(s=>/^__Host-eidos_session=[a-f0-9]{64}$/.test(s));
    if (session) headers.set('cookie',session);
    headers.set('x-eidos-platform-token', env.EIDOS_PLATFORM_TOKEN);
    // Optional project-scoped Vercel automation credential, configured only on Pages previews.
    if (env.EIDOS_PLATFORM_PREVIEW_BYPASS) headers.set('x-vercel-protection-bypass', env.EIDOS_PLATFORM_PREVIEW_BYPASS);
    headers.set('x-eidos-site-origin', url.origin);
    headers.set('x-eidos-client-ip', request.headers.get('CF-Connecting-IP') || 'unknown');
    const payload = ['GET', 'HEAD'].includes(request.method) ? undefined :
      await readText(request, path === '/api/playground/projects' ? 2_020_000 : ['/api/shop/webhook','/api/playground/webhook'].includes(path) ? 64000 : 12000);
    const response = await fetch(target, {
      method: request.method, headers, body: payload,
      redirect: 'manual', signal: AbortSignal.timeout(24000),
    });
    // Workers supports manual/follow only. Reject redirects before returning any
    // Location header or forwarding credentials to a second host.
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw new HttpError(503, 'The studio connection is temporarily unavailable.');
    }
    if (path === '/api/community/host' && response.ok && env.EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED !== 'true') {
      const result = await response.json() as Record<string, unknown>;
      result.registrationEnabled = false;
      return json(result, response.status);
    }
    const output = new Headers(response.headers);
    const setCookie = output.get('set-cookie');
    output.delete('set-cookie');
    if (['/api/members/auth','/api/members/account'].includes(path) && setCookie && /^__Host-eidos_session=(?:[a-f0-9]{64})?; Path=\/; HttpOnly; SameSite=Lax; Max-Age=(?:0|2592000); Secure$/.test(setCookie)) output.set('set-cookie',setCookie);
    output.set('cache-control', 'no-store');
    output.set('x-content-type-options', 'nosniff');
    return new Response(response.body, { status: response.status, headers: output });
  } catch (error) {
    // Never fall back to another host/provider after a relay failure.
    return json({ error: error instanceof HttpError ? error.message :
      'The studio connection is temporarily unavailable. Please try again shortly.' },
    error instanceof HttpError ? error.status : 503);
  }
}
