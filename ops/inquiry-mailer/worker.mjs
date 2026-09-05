// Private Pages service binding. Keep workers.dev, previews, and public routes disabled.
const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/inquiry') return json({ ok: false }, 404);
    if (!env.EMAIL || !env.STUDIO_TO || !env.STUDIO_FROM || !env.INQUIRY_LIMIT) return json({ ok: false }, 503);
    try {
      const reader = request.body?.getReader();
      if (!reader) return json({ ok: false }, 400);
      let size = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 12_000) { await reader.cancel(); return json({ ok: false }, 413); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const body = JSON.parse(new TextDecoder().decode(bytes));
      if (!body || typeof body !== 'object' || typeof body.brief !== 'string' || body.brief.length < 20 || body.brief.length > 5_000 || typeof body.email !== 'string' || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email) || body.email.length > 260) return json({ ok: false }, 400);
      const visitor = request.headers.get('x-eidos-inquiry-client');
      if (!visitor || visitor.length > 100) return json({ ok: false }, 400);
      if (!(await env.INQUIRY_LIMIT.limit({ key: visitor })).success) return json({ ok: false }, 429);
      const receipt = crypto.randomUUID();
      const result = await env.EMAIL.send({
        from: env.STUDIO_FROM,
        to: env.STUDIO_TO,
        replyTo: body.email,
        subject: 'Eidos Works project inquiry',
        text: `${body.brief}\n\nInquiry reference: ${receipt}`,
      });
      if (!result?.messageId) return json({ ok: false }, 502);
      return json({ ok: true, receipt, providerMessageId: result.messageId });
    } catch {
      // Do not log private form values, provider responses, or addresses.
      return json({ ok: false }, 502);
    }
  },
};
