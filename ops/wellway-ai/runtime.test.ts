import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare } from "miniflare";
import { evidence, seedState } from "../../apps/wellway/src/lib/data";
import { onRequest } from "../../functions/api/wellway/[[path]]";

test("real Workers runtime: durable admission, structured response, duplicate and size rejection, shared cap", async () => {
  const compiled = await build({
    entryPoints: ["ops/wellway-ai/index.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    external: ["cloudflare:workers"],
  });
  let calls = 0;
  const mf = new Miniflare({
    modules: true,
    script: compiled.outputFiles[0].text,
    compatibilityDate: "2026-06-10",
    durableObjects: {
      WELLWAY_BUDGET: { className: "WellwayBudget", useSQLite: true },
    },
    bindings: {
      WELLWAY_AI_ENABLED: "true",
      WELLWAY_TOTAL_MICRO_USD: "20000",
      WELLWAY_DAILY_MICRO_USD: "20000",
      OPENAI_API_KEY: "test-only",
      WELLWAY_RATE_SECRET: "test-only-independent-rate-secret",
    },
    outboundService: async (request: Request) => {
      assert.equal(new URL(request.url).hostname, "api.openai.com");
      calls++;
      const payload = (await request.json()) as {
        store: boolean;
        max_output_tokens: number;
      };
      assert.equal(payload.store, false);
      assert.equal(payload.max_output_tokens, 1200);
      return Response.json({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  segments: [
                    {
                      kind: "explanation",
                      text: "No sleep reading is supplied for September 8.",
                      sourceIds: ["missing:sleep:2026-09-08"],
                    },
                  ],
                }),
              },
            ],
          },
        ],
      });
    },
  });
  try {
    const status = await mf.dispatchFetch("http://wellway/status");
    assert.equal(
      ((await status.json()) as { aiConfigured: boolean }).aiConfigured,
      true,
    );
    const body = {
      requestId: crypto.randomUUID(),
      mode: "member",
      question: "September 8 sleep?",
      history: [],
      evidence: evidence(seedState()),
    };
    const ask = (value: unknown, ip = "192.0.2.1") =>
      mf.dispatchFetch("http://wellway/ask", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-wellway-verified-ip": ip,
        },
        body: JSON.stringify(value),
      });
    const result = await ask(body);
    assert.equal(result.status, 200, await result.clone().text());
    assert.equal(((await result.json()) as { mode: string }).mode, "live");
    assert.equal(calls, 1);
    assert.equal((await ask(body)).status, 429);
    assert.equal(calls, 1);
    assert.equal(
      (
        await ask({
          ...body,
          requestId: crypto.randomUUID(),
          padding: "x".repeat(100001),
        })
      ).status,
      413,
    );
    assert.equal(calls, 1);
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        ask({ ...body, requestId: crypto.randomUUID() }, `192.0.2.${i + 2}`),
      ),
    );
    assert.ok(results.some((r) => r.status === 429));
    assert.ok(calls < 11);
    assert.ok(results.every((r) => [200, 429].includes(r.status)));
  } finally {
    await mf.dispose();
  }
});
test("Pages relay fails closed and replaces spoofed browser identity", async () => {
  const base = "https://eidos-works.com";
  const noService = await onRequest({
    request: new Request(base + "/api/wellway/status"),
    env: {},
  });
  assert.deepEqual(await noService.json(), { aiConfigured: false });
  const cross = await onRequest({
    request: new Request(base + "/api/wellway/ask", {
      method: "POST",
      headers: { origin: "https://wrong.example" },
    }),
    env: {},
  });
  assert.equal(cross.status, 403);
  let observed: Request | undefined;
  const result = await onRequest({
    request: new Request(base + "/api/wellway/ask", {
      method: "POST",
      headers: {
        origin: base,
        "cf-connecting-ip": "192.0.2.8",
        "x-wellway-verified-ip": "spoofed",
      },
      body: "{}",
    }),
    env: {
      WELLWAY_AI: {
        fetch: async (r) => {
          observed = r;
          return Response.json({ ok: true });
        },
      },
    },
  });
  assert.equal(result.status, 200);
  assert.equal(observed?.headers.get("x-wellway-verified-ip"), "192.0.2.8");
  assert.equal(new URL(observed!.url).pathname, "/ask");
});
