import { HttpError, json, readText } from './_shared/platform/core';

interface RelayContext {
  request: Request;
  env: { EIDOS_PLATFORM_URL?: string; EIDOS_PLATFORM_TOKEN?: string };
  next(): Promise<Response>;
}
const routes = new Set([
  '/api/assistant', '/api/public-config',
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
    headers.set('x-eidos-platform-token', env.EIDOS_PLATFORM_TOKEN);
    headers.set('x-eidos-site-origin', url.origin);
    headers.set('x-eidos-client-ip', request.headers.get('CF-Connecting-IP') || 'unknown');
    const payload = ['GET', 'HEAD'].includes(request.method) ? undefined :
      await readText(request, path === '/api/shop/webhook' ? 64000 : 12000);
    const response = await fetch(target, {
      method: request.method, headers, body: payload,
      redirect: 'error', signal: AbortSignal.timeout(24000),
    });
    const output = new Headers(response.headers);
    output.delete('set-cookie');
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
