import { readText, HttpError } from "../../_shared/platform/core";
interface Env {
  WELLWAY_AI?: { fetch(request: Request): Promise<Response> };
}
export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/wellway/, "");
  const headers = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
  if (!["/status", "/ask"].includes(route))
    return Response.json({ error: "Not found." }, { status: 404, headers });
  if (
    route === "/ask" &&
    (request.method !== "POST" || request.headers.get("origin") !== url.origin)
  )
    return Response.json(
      { error: "Open Wellway on this site to ask a question." },
      { status: 403, headers },
    );
  if (route === "/status" && request.method !== "GET")
    return Response.json({ error: "GET required." }, { status: 405, headers });
  if (!env.WELLWAY_AI)
    return Response.json(
      route === "/status"
        ? { aiConfigured: false }
        : { error: "Live AI is unavailable. Guided answers remain available." },
      { status: route === "/status" ? 200 : 503, headers },
    );
  const forwarded = new Headers({
    "content-type": request.headers.get("content-type") || "application/json",
  });
  // Ignore client-supplied identity headers. Cloudflare sets CF-Connecting-IP at its edge.
  if (request.headers.has("cf-connecting-ip"))
    forwarded.set(
      "x-wellway-verified-ip",
      request.headers.get("cf-connecting-ip")!,
    );
  const length = request.headers.get("content-length");
  if (length) forwarded.set("content-length", length);
  try {
    return await env.WELLWAY_AI.fetch(
      new Request(`https://wellway.internal${route}`, {
        method: request.method,
        headers: forwarded,
        body:
          request.method === "POST"
            ? await readText(request, 100_000)
            : undefined,
        signal: request.signal,
      }),
    );
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof HttpError
            ? e.message
            : "Live AI is temporarily unavailable. Guided answers remain available.",
      },
      { status: e instanceof HttpError ? e.status : 503, headers },
    );
  }
}
