/** Optional loopback server. Hosted inference uses the private Cloudflare Worker and durable ledger. */
import http from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateAIRequest,
  providerPayload,
  reservation,
  validateAIResult,
  MODEL,
  MAX_BODY_BYTES,
} from "./src/lib/ai-contract.ts";
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.WELLWAY_PORT || 4318);
const key = process.env.OPENAI_API_KEY;
const totalCap = Number(process.env.WELLWAY_TOTAL_MICRO_USD || 0),
  dailyCap = Number(process.env.WELLWAY_DAILY_MICRO_USD || 0);
const configured = Boolean(
  process.env.WELLWAY_AI_ENABLED === "true" &&
    key &&
    Number.isSafeInteger(totalCap) &&
    totalCap > 0 &&
    Number.isSafeInteger(dailyCap) &&
    dailyCap > 0,
);
const usageFile = path.join(root, ".local", "usage-v2.json");
let usage = { day: "", daily: 0, total: 0, calls: 0 };
let ledgerReadable = true;
try {
  const parsed = JSON.parse(await readFile(usageFile, "utf8"));
  if (
    ![parsed.daily, parsed.total, parsed.calls].every(Number.isSafeInteger) ||
    typeof parsed.day !== "string"
  )
    throw new Error("Invalid quota file");
  usage = parsed;
} catch (e) {
  if (e.code !== "ENOENT") ledgerReadable = false;
}
let busy = false;
const json = (res, status, body) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
};
const server = http.createServer(async (req, res) => {
  try {
    if (
      ![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)
    ) {
      json(res, 403, { error: "Only the local app can access this server." });
      return;
    }
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (
      ["/api/status", "/api/wellway/status"].includes(url.pathname) &&
      req.method === "GET"
    ) {
      json(res, 200, {
        aiConfigured: configured && ledgerReadable && usage.total < totalCap,
        model: configured ? MODEL : null,
      });
      return;
    }
    if (["/api/ask", "/api/wellway/ask"].includes(url.pathname)) {
      if (req.method !== "POST") {
        json(res, 405, { error: "POST required." });
        return;
      }
      if (
        ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(
          req.headers.origin,
        )
      ) {
        json(res, 403, { error: "Open the local app to ask a question." });
        return;
      }
      if (!configured || !ledgerReadable) {
        json(res, 503, {
          error: "Live AI is unavailable. Guided answers remain available.",
        });
        return;
      }
      if (!req.headers["content-type"]?.startsWith("application/json")) {
        json(res, 415, { error: "JSON required." });
        return;
      }
      let bytes = 0;
      const chunks = [];
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) {
          json(res, 413, { error: "The record package is too large." });
          return;
        }
        chunks.push(chunk);
      }
      let input;
      try {
        input = validateAIRequest(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        json(res, 400, { error: "The record package could not be validated." });
        return;
      }
      if (busy) {
        json(res, 429, { error: "One response is already being prepared." });
        return;
      }
      busy = true;
      try {
        const today = new Date().toISOString().slice(0, 10);
        if (usage.day !== today)
          usage = { ...usage, day: today, daily: 0, calls: 0 };
        const payload = providerPayload(input),
          charge = reservation(payload).microUsd;
        if (
          usage.total + charge > totalCap ||
          usage.daily + charge > dailyCap ||
          usage.calls >= 12
        ) {
          json(res, 429, {
            error:
              "The local AI allowance is used. Guided answers remain available.",
          });
          return;
        }
        usage = {
          ...usage,
          total: usage.total + charge,
          daily: usage.daily + charge,
          calls: usage.calls + 1,
        };
        await mkdir(path.dirname(usageFile), { recursive: true });
        await writeFile(usageFile, JSON.stringify(usage), { mode: 0o600 });
        const controller = new AbortController(),
          timer = setTimeout(() => controller.abort(), 25000);
        const cancel = () => {
          if (!res.writableEnded) controller.abort();
        };
        res.on("close", cancel);
        try {
          const upstream = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          if (!upstream.ok) throw new Error("Provider unavailable");
          const raw = await upstream.json();
          if (raw.status !== "completed")
            throw new Error("Incomplete response");
          const text = (raw.output || [])
            .flatMap((o) => o.content || [])
            .filter((c) => c.type === "output_text")
            .map((c) => c.text)
            .join("");
          json(res, 200, validateAIResult(JSON.parse(text), input.evidence));
        } catch {
          if (!res.destroyed)
            json(res, 502, {
              error:
                "The response could not be completed and verified. Try again or use guided answers.",
            });
        } finally {
          clearTimeout(timer);
          res.removeListener("close", cancel);
        }
      } finally {
        busy = false;
      }
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      json(res, 405, { error: "Method not allowed." });
      return;
    }
    if (url.pathname === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }
    const target = ["/", "/demos/wellway/"].includes(url.pathname)
      ? "/wellway-demo.html"
      : decodeURIComponent(url.pathname);
    const file = path.resolve(root, "dist", "." + target),
      dist = path.resolve(root, "dist") + path.sep;
    if (!file.startsWith(dist)) {
      json(res, 403, { error: "Forbidden." });
      return;
    }
    let data;
    try {
      if (!(await stat(file)).isFile()) throw new Error();
      data = await readFile(file);
    } catch {
      json(res, 404, { error: "Not found. Run npm run build first." });
      return;
    }
    const mime =
      {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".woff2": "font/woff2",
        ".png": "image/png",
        ".svg": "image/svg+xml",
      }[path.extname(file)] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": mime,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    if (!res.destroyed)
      json(res, 500, {
        error: "The local server could not complete the request.",
      });
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Wellway local app: http://127.0.0.1:${port}\nLive AI: ${configured && ledgerReadable ? "configured with explicit usage caps" : "disabled; guided answers available"}`,
  ),
);
