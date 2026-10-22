import { readFileSync } from 'node:fs';
import type { Plugin, Connect } from 'vite';
import { onRequestGet } from '../functions/playground-frame';

/** Exercise the real frame handler and deployed CSP in Vite browser acceptance. */
export function playgroundFramePreview(): Plugin {
  const policy = readFileSync('public/_headers', 'utf8').match(/^ {2}Content-Security-Policy: (.+)$/m)![1];
  const serve = (enforcePolicy: boolean): Connect.NextHandleFunction => async (request, response, next) => {
    if ((request.url || '').split('?')[0] === '/playground-frame') {
      if (!['GET', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405); response.end(); return; }
      const result = onRequestGet();
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(request.method === 'HEAD' ? undefined : await result.text());
      return;
    }
    if (enforcePolicy) response.setHeader('Content-Security-Policy', policy);
    next();
  };
  return {
    name: 'eidos-secure-playground-preview',
    configureServer(server) { server.middlewares.use(serve(false)); },
    configurePreviewServer(server) { server.middlewares.use(serve(true)); },
  };
}
