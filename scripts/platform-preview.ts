/** Local-only adapter: the same Pages handlers run against SQLite for full browser QA. */
import type { Plugin } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import type {
  Database,
  Statement,
  PlatformEnv,
  Context,
} from '../functions/_shared/platform/core';
class LocalStatement implements Statement {
  constructor(
    private database: DatabaseSync,
    private sql: string,
    private values: unknown[] = [],
  ) {}
  bind(...values: unknown[]) {
    return new LocalStatement(this.database, this.sql, values);
  }
  async first<T>() {
    return (this.database.prepare(this.sql).get(...(this.values as never[])) ||
      null) as T | null;
  }
  async all<T>() {
    return {
      results: this.database
        .prepare(this.sql)
        .all(...(this.values as never[])) as T[],
    };
  }
  async run() {
    const result = this.database
      .prepare(this.sql)
      .run(...(this.values as never[]));
    return { meta: { changes: Number(result.changes) } };
  }
}
export function platformPreview(): Plugin {
  let connection: DatabaseSync | undefined;
  return {
    name: 'eidos-local-platform',
    apply: 'serve',
    configureServer(server) {
      mkdirSync('.wrangler/eidos-preview', { recursive: true });
      connection = new DatabaseSync('.wrangler/eidos-preview/platform.sqlite');
      connection.exec('PRAGMA foreign_keys=ON;');
      connection.exec(
        readFileSync('migrations/0001_eidos_platform.sql', 'utf8'),
      );
      const database: Database = {
        prepare: (sql) => new LocalStatement(connection!, sql),
        batch: async (statements) => {
          connection!.exec('BEGIN');
          try {
            const results = [];
            for (const statement of statements)
              results.push(await statement.run());
            connection!.exec('COMMIT');
            return results;
          } catch (error) {
            connection!.exec('ROLLBACK');
            throw error;
          }
        },
      };
      // These values only exist in the local Vite process. No provider calls or live payments.
      const env: PlatformEnv = {
        EIDOS_DB: database,
        EIDOS_LOCAL_TEST: 'true',
        EIDOS_RATE_SECRET: 'local-preview-rate-key',
        EIDOS_ADMIN_TOKEN: 'local-preview-review-token-2026-eidos',
        PUBLIC_SITE_URL: 'http://terminal.local:4173',
      };
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '/').split('?')[0];
        if (path === '/kit-preview') {
          res.writeHead(307, { location: '/kit-preview/' });
          res.end();
          return;
        }
        if (path === '/kit-preview/') {
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.end(readFileSync('public/kit-preview/index.html', 'utf8'));
          return;
        }
        if (path === '/__qa/view') {
          const query = new URL(req.url!, 'http://terminal.local:4173')
            .searchParams;
          const width = Math.min(
              1440,
              Math.max(280, Number(query.get('width')) || 390),
            ),
            height = Math.min(
              1100,
              Math.max(280, Number(query.get('height')) || 844),
            );
          const target = query.get('path') || '/';
          const safe = /^\/[a-z0-9/-]*$/.test(target) ? target : '/';
          res.setHeader('content-type', 'text/html');
          res.end(
            `<!doctype html><html><head><title>Responsive QA</title><style>body{margin:0;background:#ccd6d9;display:grid;justify-content:center}iframe{display:block;border:0;background:#fff;width:${width}px;height:${height}px}</style></head><body><iframe title="Responsive site preview" src="${safe}"></iframe></body></html>`,
          );
          return;
        }
        let modulePath: string | undefined;
        let params: Record<string, string> | undefined;
        const routes: Record<string, string> = {
          '/api/public-config': 'functions/api/public-config.ts',
          '/api/assistant': 'functions/api/assistant.ts',
          '/api/intelligence': 'functions/api/intelligence.ts',
          '/api/project-inquiries': 'functions/api/project-inquiries.ts',
          '/api/community/threads': 'functions/api/community/threads.ts',
          '/api/community/replies': 'functions/api/community/replies.ts',
          '/api/community/moderate': 'functions/api/community/moderate.ts',
          '/api/community/agents': 'functions/api/community/agents.ts',
          '/api/community/maintenance':
            'functions/api/community/maintenance.ts',
          '/api/shop/checkout': 'functions/api/shop/checkout.ts',
          '/api/shop/status': 'functions/api/shop/status.ts',
          '/api/shop/download': 'functions/api/shop/download.ts',
          '/api/shop/webhook': 'functions/api/shop/webhook.ts',
          '/community/feed': 'functions/community/feed.ts',
          '/community/sitemap.xml': 'functions/community/sitemap.xml.ts',
        };
        modulePath = routes[path];
        if (path.startsWith('/community/thread/')) {
          modulePath = 'functions/community/thread/[id].ts';
          params = { id: path.slice('/community/thread/'.length) };
        }
        if (!modulePath) {
          next();
          return;
        }
        try {
          const method = req.method || 'GET';
          const handler = (await server.ssrLoadModule('/' + modulePath))[
            'onRequest' + method[0] + method.slice(1).toLowerCase()
          ] as ((context: Context) => Promise<Response>) | undefined;
          if (!handler) {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 64000) {
              res.statusCode = 413;
              res.end('Request too large');
              return;
            }
            chunks.push(chunk);
          }
          const headers = new Headers();
          for (const [name, value] of Object.entries(req.headers)) {
            if (value !== undefined)
              headers.set(name, Array.isArray(value) ? value.join(',') : value);
          }
          const request = new Request(
            'http://' + (req.headers.host || 'terminal.local:4173') + req.url,
            {
              method,
              headers,
              ...(!['GET', 'HEAD'].includes(method)
                ? { body: Buffer.concat(chunks) }
                : {}),
            },
          );
          const response = await handler({ request, env, params });
          res.statusCode = response.status;
          response.headers.forEach((value, name) => res.setHeader(name, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          res.statusCode = 503;
          res.setHeader('content-type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'The local service could not complete this request.',
            }),
          );
        }
      });
    },
    closeBundle() {
      connection?.close();
    },
  };
}
