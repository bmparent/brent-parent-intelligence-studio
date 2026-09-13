import { DurableObject } from "cloudflare:workers";
import { initialize, reserve, type Storage, type Reservation } from "./ledger";
import {
  MODEL,
  MAX_BODY_BYTES,
  providerPayload,
  reservation,
  validateAIRequest,
  validateAIResult,
} from "../../apps/wellway/src/lib/ai-contract";

interface Env {
  WELLWAY_BUDGET: DurableObjectNamespace<WellwayBudget>;
  OPENAI_API_KEY?: string;
  WELLWAY_RATE_SECRET?: string;
  WELLWAY_AI_ENABLED?: string;
  WELLWAY_TOTAL_MICRO_USD?: string;
  WELLWAY_DAILY_MICRO_USD?: string;
}
export class WellwayBudget extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    initialize(ctx.storage as unknown as Storage);
  }
  reserve(input: Reservation) {
    return reserve(this.ctx.storage as unknown as Storage, input);
  }
  available(totalCap: number, dailyCap: number, now: number) {
    const used = [
      ...this.ctx.storage.sql.exec<{ used: number }>(
        "SELECT used FROM budget WHERE id=1",
      ),
    ][0].used;
    const daily = [
      ...this.ctx.storage.sql.exec<{ used: number; calls: number }>(
        "SELECT used,calls FROM daily WHERE day=?",
        new Date(now).toISOString().slice(0, 10),
      ),
    ][0];
    return (
      used < totalCap &&
      (!daily || (daily.used < dailyCap && daily.calls < 100))
    );
  }
}
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
const cap = (v: string | undefined) => {
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 && n <= 10_000_000 ? n : 0;
};
async function boundedBody(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function hash(text: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)),
    ),
  ]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    const totalCap = cap(env.WELLWAY_TOTAL_MICRO_USD),
      dailyCap = cap(env.WELLWAY_DAILY_MICRO_USD);
    const enabled = !!(
      env.WELLWAY_AI_ENABLED === "true" &&
      env.OPENAI_API_KEY &&
      env.WELLWAY_RATE_SECRET &&
      totalCap &&
      dailyCap &&
      env.WELLWAY_BUDGET
    );
    try {
      // One coordination atom owns the entire showcase budget. Inference runs in the Worker.
      const budget = env.WELLWAY_BUDGET?.getByName(
        "wellway-showcase-budget-v1",
      );
      if (path === "/status" && request.method === "GET")
        return json({
          aiConfigured:
            enabled && (await budget.available(totalCap, dailyCap, Date.now())),
          model: enabled ? MODEL : null,
        });
      if (path !== "/ask") return json({ error: "Not found." }, 404);
      if (request.method !== "POST")
        return json({ error: "POST required." }, 405);
      if (!enabled)
        return json(
          { error: "Live AI is unavailable. Guided answers are ready to use." },
          503,
        );
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        return json({ error: "JSON required." }, 415);
      const ip = request.headers.get("x-wellway-verified-ip");
      if (!ip)
        return json({ error: "The connection could not be verified." }, 403);
      let input;
      try {
        input = validateAIRequest(await boundedBody(request));
      } catch (e) {
        return json(
          {
            error:
              e instanceof Error && e.message === "size"
                ? "The record package is too large."
                : "The record package could not be validated. Reopen the assistant and try again.",
          },
          e instanceof Error && e.message === "size" ? 413 : 400,
        );
      }
      const payload = providerPayload(input),
        charge = reservation(payload);
      const visitor = await hash(ip, env.WELLWAY_RATE_SECRET!);
      const receipt = await budget.reserve({
        requestId: await hash(input.requestId, env.WELLWAY_RATE_SECRET!),
        visitor,
        microUsd: charge.microUsd,
        totalCap,
        dailyCap,
        now: Date.now(),
      });
      if (!receipt.ok)
        return json(
          {
            error:
              receipt.reason === "duplicate"
                ? "This request has already been submitted. Ask again to start a new request."
                : receipt.reason === "visitor"
                  ? "You have reached the conversation limit. Try again later or use guided answers."
                  : "The shared AI allowance is used for now. Guided answers remain available.",
          },
          429,
        );
      const controller = new AbortController();
      const abort = () => controller.abort();
      request.signal.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(abort, 25_000);
      try {
        const upstream = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!upstream.ok) {
          await upstream.body?.cancel();
          return json(
            {
              error:
                "The AI service could not complete this request. Try again or use guided answers.",
            },
            502,
          );
        }
        const raw = (await upstream.json()) as {
          status?: string;
          output?: { content?: { type: string; text?: string }[] }[];
        };
        if (raw.status !== "completed")
          return json(
            { error: "The AI response was incomplete. Please try again." },
            502,
          );
        const text = (raw.output || [])
          .flatMap((o) => o.content || [])
          .filter((c) => c.type === "output_text")
          .map((c) => c.text || "")
          .join("");
        const result = validateAIResult(JSON.parse(text), input.evidence);
        return json(result);
      } catch {
        return json(
          {
            error: controller.signal.aborted
              ? "The request was cancelled or timed out. You can try again."
              : "The response could not be verified against the supplied records. Please try again.",
          },
          502,
        );
      } finally {
        clearTimeout(timeout);
        request.signal.removeEventListener("abort", abort);
      }
    } catch {
      return json(
        {
          error:
            "Live AI is temporarily unavailable. Guided answers remain available.",
        },
        503,
      );
    }
  },
};
