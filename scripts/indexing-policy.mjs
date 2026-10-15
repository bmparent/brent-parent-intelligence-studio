// A release policy, independent of the sitemap generator, so a missing entry
// cannot silently remove a released public page from verification.
export const SITE_ORIGIN = 'https://eidos-works.com';
export const REQUIRED_PUBLIC_PATHS = [
  '/', '/about', '/contact', '/central-florida', '/friction-review', '/work',
  '/work/nighttime-spectaculars', '/work/holidays-in-hollywood', '/work/disney-villains',
  '/work/beauty-and-the-beast', '/work/jingle-bell-jingle-bam', '/work/pernr-access-gate',
  '/work/production-dashboard', '/work/storefront-experience',
  '/services/digital-experiences', '/services/business-systems', '/services/intelligent-systems',
  '/services/storefront-access-systems', '/services/dashboards-workflow-tools', '/services/agentic-seo',
  '/lab', '/lab/access', '/lab/eidos-brain', '/community', '/community/agents',
  '/community/agent-guide', '/community/guidelines', '/privacy', '/terms',
  '/shop/cinematic-starter', '/snapshot', '/insights', '/editorial-policy',
  '/quote-desk/', '/quote-desk/quote-guide', '/demos/wellway/',
];

// Only static unauthenticated shells and made-up rewrite paths are requested.
// No account identifiers, recovery tokens, cookies, or private API bodies.
export const EXCLUDED_PAGES = [
  { path: '/account', header: true },
  { path: '/account/verify', header: true },
  { path: '/account/unsubscribe', header: true },
  { path: '/shop/success', header: true },
  { path: '/snapshot/start' },
  { path: '/snapshot/success', header: true },
  { path: '/community/moderate', header: true },
  { path: '/playground' },
  { path: '/kit-preview/', header: true },
  { path: '/quote-desk/terms', file: 'quote-desk/terms.html', header: true },
  { path: '/quote-desk/privacy', file: 'quote-desk/privacy.html', header: true },
  { path: '/members/indexing_probe', file: 'private-app.html', header: true, headOnly: true },
  { path: '/snapshot/result/indexing-probe-not-a-real-token', file: 'private-app.html', header: true, headOnly: true },
];
export const ROBOTS_EXCLUSIONS = [
  '/snapshot/result/indexing-probe-not-a-real-token', '/snapshot/success',
  '/community/moderate', '/shop/success', '/api/growth/report',
];

export function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity[0] === '#') return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10));
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity.toLowerCase()];
  });
}

export function hasNoindex(value = '') {
  return /(?:^|[\s,:])(?:noindex|none)(?:$|[\s,;])/i.test(value);
}

export function htmlMetadata(html) {
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || html)
    .replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const canonical = [], robots = [];
  for (const [tag, name] of head.matchAll(/<(meta|link)\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map(([, key, quoted, single, bare]) => [key.toLowerCase(), decodeEntities(quoted ?? single ?? bare)]));
    if (name.toLowerCase() === 'link' && (attrs.rel || '').toLowerCase().split(/\s+/).includes('canonical')) canonical.push(attrs.href || '');
    if (name.toLowerCase() === 'meta' && /^(?:robots|[\w-]*bot(?:-[\w-]+)?|slurp)$/i.test(attrs.name || '')) robots.push(attrs.content || '');
  }
  return { canonical, robots };
}

export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>\s*([^<]+)\s*<\/loc>/gi)].map(([, value]) => decodeEntities(value.trim()));
}

function globPattern(value) {
  return value.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
}

export function robotsAllowed(text, path, agent = '*') {
  const groups = []; let group;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const name = match[1].trim().toLowerCase(), value = match[2].trim();
    if (name === 'user-agent') {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if (group && ['allow', 'disallow'].includes(name) && value) group.rules.push({ allow: name === 'allow', value });
  }
  const scored = groups.map((g) => ({ ...g, score: Math.max(-1, ...g.agents.map((a) => a === '*' ? 0 : agent.toLowerCase().includes(a) ? a.length : -1)) }));
  const best = Math.max(-1, ...scored.map((g) => g.score));
  const rules = scored.filter((g) => g.score === best && best >= 0).flatMap((g) => g.rules)
    .filter(({ value }) => new RegExp(`^${globPattern(value.replace(/\$$/, ''))}${value.endsWith('$') ? '$' : ''}`).test(path))
    .sort((a, b) => b.value.replace(/[*$]/g, '').length - a.value.replace(/[*$]/g, '').length || Number(b.allow) - Number(a.allow));
  return rules[0]?.allow ?? true;
}

// Conservative source check only. The HTTP mode remains authoritative because
// Pages Functions do not inherit _headers, and edge rules can add other headers.
export function sourceRobotsHeaders(source, path) {
  const values = []; let matches = false;
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) matches = new RegExp(`^${globPattern(line.trim())}$`).test(path);
    else if (matches) {
      const match = line.match(/^\s*x-robots-tag:\s*(.*)$/i);
      if (match) values.push(match[1]);
    }
  }
  return values;
}

export function checkPublicPage({ path, finalPath = path, canonical, html, headers = [], robots }) {
  const errors = [], meta = htmlMetadata(html);
  if (meta.canonical.length !== 1 || meta.canonical[0] !== canonical) errors.push(`${path}: expected exactly one canonical ${canonical}; found ${meta.canonical.join(', ') || 'none'}`);
  if (meta.robots.some(hasNoindex)) errors.push(`${path}: HTML robots metadata contains noindex/none`);
  if (headers.some(hasNoindex)) errors.push(`${path}: X-Robots-Tag contains noindex/none (${headers.join('; ')})`);
  for (const candidate of new Set([path, finalPath])) {
    for (const agent of ['*', 'Googlebot', 'Bingbot']) if (!robotsAllowed(robots, candidate, agent)) errors.push(`${candidate}: robots.txt blocks ${agent}`);
  }
  return errors;
}

export function excludedPath(path) {
  return EXCLUDED_PAGES.some((entry) => entry.path.replace(/\/$/, '') === path.replace(/\/$/, '')) ||
    /^\/(?:api|members|account)(?:\/|$)/.test(path) || /^\/snapshot\/result(?:\/|$)/.test(path) || path === '/private-app.html' || path === '/404';
}
