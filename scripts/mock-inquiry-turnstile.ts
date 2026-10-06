/** Test-only Siteverify response; production code always calls the real Cloudflare endpoint. */
export async function withInquiryTurnstile<T>(run: () => Promise<T>, hostname = 'eidos-works.com'): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (String(input) !== 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
      return original(input, init);
    const body = JSON.parse(String(init?.body)) as { response: string };
    return Response.json({
      success: body.response === 'verified-local-token' || body.response === 'valid-turnstile-token',
      hostname,
      action: 'inquiry',
    });
  };
  try { return await run(); } finally { globalThis.fetch = original; }
}
