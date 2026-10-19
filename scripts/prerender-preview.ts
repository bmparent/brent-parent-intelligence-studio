import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Plugin } from 'vite';

/** Vite preview otherwise sends the homepage SPA fallback for a slashless
 * directory route. Serve only an existing built directory index, retaining the
 * visitor's URL and query so preview hydrates the page that was actually asked for. */
export function previewDirectoryIndex(root: string, outDir: string, requestUrl: string, method = 'GET'): string | undefined {
  if (method !== 'GET' && method !== 'HEAD') return;
  const queryAt = requestUrl.indexOf('?');
  const pathname = queryAt === -1 ? requestUrl : requestUrl.slice(0, queryAt);
  if (pathname.endsWith('/') || pathname === '/api' || pathname.startsWith('/api/') || !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(pathname)) return;
  const output = resolve(root, outDir);
  const target = resolve(output, pathname.slice(1), 'index.html');
  if (!target.startsWith(output + sep)) return;
  try { if (!statSync(target).isFile()) return; }
  catch { return; }
  return `${pathname}/index.html${queryAt === -1 ? '' : requestUrl.slice(queryAt)}`;
}

export function prerenderPreview(): Plugin {
  return {
    name: 'eidos-prerender-directory-preview',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const resolved = previewDirectoryIndex(server.config.root, server.config.build.outDir, request.url || '/', request.method);
        if (resolved) request.url = resolved;
        next();
      });
    },
  };
}
