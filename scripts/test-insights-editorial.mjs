import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = resolve('scripts/validate-insights.mjs');
const slug = 'a-life-beyond-the-screen';
const canonical = `https://eidos-works.com/insights/${slug}`;

const essay = {
  title: 'A Life Beyond the Screen', slug,
  description: 'A reflective essay about attention and the systems people live with.',
  dek: 'A reflective essay about attention.',
  category: 'Website Strategy',
  publishedAt: '2026-09-01T12:00:00-04:00',
  updatedAt: '2026-09-01T12:00:00-04:00',
  author: 'Eidos Works Editorial', byline: 'Eidos Works Editorial',
  readingTimeMinutes: 2,
  tags: ['attention', 'design', 'life'],
  canonicalPath: `/insights/${slug}`,
  excerpt: 'A reflective essay about attention.',
  pillar: 'Human side of technology', slot: 'evening', format: 'essay',
  searchIntent: 'reflection on attention', featured: true, draft: false,
  thesis: 'Design should return attention to people.',
  sources: [], takeaways: [], relatedSlugs: [],
  body: [
    { heading: 'The hour we lose', paragraphs: ['Every interruption asks for a small part of a life.'] },
    { heading: 'What we choose to make', paragraphs: ['A better system respects the time it asks for.'] }
  ],
  cta: { label: 'Talk with Eidos Works', href: '/contact' },
  ogImage: `/insights-og/${slug}.svg`
};

test('reflective essays pass without a bibliography, takeaway box, or guide headings; guides still require them', async () => {
  const root = await mkdtemp(join(tmpdir(), 'insights-editorial-'));
  try {
    await mkdir(join(root, 'src/data'), { recursive: true });
    await mkdir(join(root, 'public/insights-og'), { recursive: true });
    for (const name of ['sitemap.xml', 'feed.xml', 'llms.txt']) {
      await writeFile(join(root, 'public', name), canonical);
    }
    await writeFile(join(root, 'public/insights-og', `${slug}.svg`), '<svg xmlns="http://www.w3.org/2000/svg"/>');

    const run = (record) => writeFile(join(root, 'src/data/articles.json'), JSON.stringify([record]));
    await run(essay);
    const accepted = spawnSync(process.execPath, [validator, '--skip-source-fetch'], { cwd: root, encoding: 'utf8' });
    assert.equal(accepted.status, 0, accepted.stderr);

    await run({ ...essay, format: 'practical-guide' });
    const rejected = spawnSync(process.execPath, [validator, '--skip-source-fetch'], { cwd: root, encoding: 'utf8' });
    assert.equal(rejected.status, 1, rejected.stderr);
    assert.match(rejected.stderr, /at least one source/);
    assert.match(rejected.stderr, /at least three/);
    assert.match(rejected.stderr, /missing required section/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
