import { HttpError, json, readText } from './_shared/platform/core';

interface RelayContext {
  request: Request;
  env: { EIDOS_PLATFORM_URL?: string; EIDOS_PLATFORM_TOKEN?: string; EIDOS_PLATFORM_PREVIEW_BYPASS?: string };
  next(): Promise<Response>;
}
const routes = new Set([
  '/api/assistant', '/api/public-config',
  '/api/playground/projects', '/api/playground/checkout', '/api/playground/purchases', '/api/playground/webhook',
  '/api/members/auth', '/api/members/account', '/api/members/directory', '/api/members/unsubscribe',
  '/api/community/threads', '/api/community/replies', '/api/community/agents',
  '/api/community/moderate', '/api/community/maintenance',
  '/api/shop/checkout', '/api/shop/status', '/api/shop/download', '/api/shop/webhook',
  '/community/feed', '/community/sitemap.xml',
]);

/** Transport only. Research, model calls, storage and payment processing run in Sentinel. */
export async function onRequest({ request, env, next }: RelayContext) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (!routes.has(path) && !/^\/community\/thread\/[a-zA-Z0-9-]+$/.test(path)) return next();
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
    for (const name of ['content-type', 'authorization', 'origin', 'stripe-signature']) {
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
