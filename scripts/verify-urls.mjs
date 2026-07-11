import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = [
  'src/config/site.ts',
  'src/data/pages.ts',
  'src/data/articles.ts',
  'src/components/HomePage.tsx',
  'src/components/SnapshotPages.tsx',
  'src/components/AgenticSeoPage.tsx',
  'index.html',
  'public/sitemap.xml',
  'public/robots.txt',
  'public/feed.xml',
  'public/llms.txt'
];

const contentByFile = new Map(
  await Promise.all(
    files.map(async (file) => [file, await readFile(resolve(process.cwd(), file), 'utf8')])
  )
);
const content = [...contentByFile.values()].join('\n');

const required = [
  'https://eidos-works.com',
  'hello@eidos-works.com',
  'projects@eidos-works.com',
  '/snapshot',
  '/services/agentic-seo',
  '/insights',
  'Agentic SEO',
  'Eidos Snapshot'
];

const forbidden = [
  'https://eidosworks.pages.dev',
  'https://eidosworks.com',
  'https://eidos.works',
  'hello@eidosworks.com',
  'projects@eidosworks.com',
  'InkSoft specialist',
  'InkSoft partner',
  'InkSoft agency'
];

const missing = required.filter((value) => !content.includes(value));
const violations = forbidden.flatMap((value) =>
  [...contentByFile.entries()]
    .filter(([, fileContent]) => fileContent.includes(value))
    .map(([file]) => `${file}: ${value}`)
);

if (missing.length || violations.length) {
  if (missing.length) {
    console.error('Missing required public references:');
    missing.forEach((value) => console.error(`- ${value}`));
  }
  if (violations.length) {
    console.error('Forbidden public references:');
    violations.forEach((value) => console.error(`- ${value}`));
  }
  process.exit(1);
}

console.log(`Verified ${files.length} public source files against ${required.length} required and ${forbidden.length} forbidden references.`);
