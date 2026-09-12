import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const failures = [];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

function matches(source, expression) {
  return [...source.matchAll(expression)];
}

for (const file of await htmlFiles(root)) {
  const html = await readFile(file, 'utf8');
  // The runnable product preview intentionally uses the unbranded downloadable template.
  if (relative(root, file).replaceAll('\\', '/').startsWith('kit-preview/')) {
    if (!/<meta name="robots" content="noindex, follow"/.test(html))
      failures.push('kit-preview: missing noindex directive');
    continue;
  }
  const label = (relative(root, file) || 'index.html').replaceAll('\\', '/');
  const h1Count = matches(html, /<h1(?:\s|>)/gi).length;
  if (h1Count !== 1)
    failures.push(`${label}: expected one h1, found ${h1Count}`);

  const ids = matches(html, /\sid="([^"]+)"/gi).map((match) => match[1]);
  const duplicateIds = [
    ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
  ];
  if (duplicateIds.length)
    failures.push(`${label}: duplicate ids: ${duplicateIds.join(', ')}`);

  const images = matches(html, /<img\b[^>]*>/gi).map((match) => match[0]);
  for (const image of images) {
    if (!/\salt="[^"]*"/i.test(image))
      failures.push(`${label}: image without alt text`);
  }

  for (const required of [
    /<title>[^<]+<\/title>/i,
    /<meta\s+name="description"\s+content="[^"]+"/i,
    /<link\s+rel="canonical"\s+href="https:\/\/eidos-works\.com(?:\/[^"#?]*)?"/i,
    /<meta\s+property="og:url"\s+content="https:\/\/eidos-works\.com(?:\/[^"#?]*)?"/i,
  ]) {
    if (!required.test(html))
      failures.push(`${label}: missing or unsafe required metadata`);
  }

  if (/href="mailto:[^"]*@/i.test(html)) {
    failures.push(
      `${label}: mailto href exposes a literal address that Cloudflare may rewrite before hydration`,
    );
  }

  const approvedPlatformPages = new Set([
    'work/index.html',
    'work/nighttime-spectaculars/index.html',
    'work/holidays-in-hollywood/index.html',
    'work/disney-villains/index.html',
    'work/beauty-and-the-beast/index.html',
    'work/jingle-bell-jingle-bam/index.html',
    'work/pernr-access-gate/index.html',
    'work/storefront-experience/index.html',
    'services/index.html',
    'services/storefront-access-systems/index.html',
  ]);
  // The gallery may link to this separately hosted calculator. Keep the
  // retired-host guard for every other reference and all canonical metadata.
  const referenceHtml = ['index.html', 'work/index.html'].includes(label)
    ? html.replaceAll('href="https://embroiderycalc-public.pages.dev/"', '')
    : html;
  if (
    /\.pages\.dev|intelligence studio/i.test(referenceHtml) ||
    (/inksoft/i.test(html) && !approvedPlatformPages.has(label))
  ) {
    failures.push(
      `${label}: contains a retired or non-canonical public reference`,
    );
  }

  const schemaBlocks = matches(
    html,
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
  );
  for (const [, json] of schemaBlocks) {
    try {
      JSON.parse(json.replaceAll('&quot;', '"'));
    } catch {
      failures.push(`${label}: invalid JSON-LD`);
    }
  }

  const privatePage = [
    'snapshot/success/index.html',
    'shop/success/index.html',
    'community/moderate/index.html',
    'account/index.html',
    'account/verify/index.html',
    'account/reset/index.html',
    'account/unsubscribe/index.html',
  ].includes(label);
  if (
    privatePage &&
    !/<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(html)
  ) {
    failures.push(`${label}: private page must be noindex, nofollow`);
  }
  if (
    privatePage &&
    !/<meta\s+name="referrer"\s+content="no-referrer"/i.test(html)
  ) {
    failures.push(`${label}: private page must prevent referrer leakage`);
  }
}

if (failures.length) {
  console.error(`Prerender verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(
  'Prerender verification passed: headings, metadata, private-page directives, image alternatives, IDs, and JSON-LD are valid.',
);
