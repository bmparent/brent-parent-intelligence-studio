import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const evidence = process.env.COMMUNITY_EVIDENCE_DIR || mkdtempSync(join(tmpdir(), 'eidos-profiles-'));
mkdirSync(evidence, { recursive: true });
const databasePath = join(mkdtempSync(join(tmpdir(), 'eidos-profiles-db-')), 'profiles.sqlite');
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4194', '--strictPort'], {
  env: { ...process.env, EIDOS_PREVIEW_DB_PATH: databasePath }, stdio: 'ignore',
});
const base = 'http://127.0.0.1:4194';
let browser;
const checks = [], errors = [];
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base + '/api/community/agents')).ok) { ready = true; break; } } catch { /* fixture starting */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Isolated profile fixture must start');
  const db = new DatabaseSync(databasePath), now = '2026-10-23T12:00:00.000Z';
  const alice = crypto.randomUUID(), bob = crypto.randomUUID(), empty = crypto.randomUUID();
  const addMember = db.prepare("INSERT INTO eidos_email_members(id,email,username,kind,created_at,newsletter_after) VALUES(?,?,?,'person',?,?)");
  for (const [id, username] of [[alice, 'qa_alice'], [bob, 'qa_bob'], [empty, 'qa_empty']]) addMember.run(id, username + '@example.test', username, now, now);
  const addThread = db.prepare("INSERT INTO eidos_threads(id,title,body,category,author,author_type,owner_id,status,created_at) VALUES(?,?,?,'build',?,'guest',?,?,?)");
  const parent = crypto.randomUUID(), hidden = crypto.randomUUID();
  addThread.run(parent, 'Public thread with a useful answer', 'The other member is building a calendar.', '@qa_bob', bob, 'published', now);
  addThread.run(hidden, 'Hidden pending work', 'Private pending content', '@qa_alice', alice, 'pending', now);
  addThread.run(crypto.randomUUID(), 'Guest copied a display name', 'This must not be attributed to the account.', '@qa_alice', null, 'published', now);
  for (let i = 0; i < 22; i++) addThread.run(crypto.randomUUID(), 'Building a useful gallery ' + i, '<script>alert("profile-xss")</script> ' + 'Public design progress. '.repeat(24), '@qa_alice', alice, 'published', new Date(Date.parse(now) + i * 1000).toISOString());
  const reply = crypto.randomUUID();
  const addReply = db.prepare("INSERT INTO eidos_replies(id,thread_id,body,author,author_type,owner_id,status,created_at) VALUES(?,?,?,'@qa_alice','guest',?,?,?)");
  addReply.run(reply, parent, 'Here is my public reply.', alice, 'published', now);
  addReply.run(crypto.randomUUID(), parent, 'Rejected private reply', alice, 'rejected', now);
  addReply.run(crypto.randomUUID(), hidden, 'Public reply under hidden thread', alice, 'published', now);
  db.close();
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  const publicRead = await fetch(base + '/api/members/directory?username=qa_alice');
  const json = await publicRead.json();
  assert.equal(publicRead.status, 200); assert.equal(json.posts.length, 20);
  assert.equal(JSON.stringify(json).includes('@example.test'), false);
  await page.goto(base + '/community', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: '@qa_alice', exact: true }).first().click();
  await page.getByRole('heading', { name: '@qa_alice', exact: true }).waitFor();
  await page.getByText('Here is my public reply.', { exact: true }).waitFor();
  assert.match(page.url(), /\/members\/qa_alice$/);
  assert.equal(await page.getByText('That page does not exist.', { exact: true }).count(), 0);
  assert.equal(await page.locator('vite-error-overlay').count(), 0);
  for (const text of ['Hidden pending work', 'Rejected private reply', 'Public reply under hidden thread', 'Guest copied a display name'])
    assert.equal(await page.getByText(text, { exact: false }).count(), 0);
  checks.push('anonymous community author link opens owned public posts and replies; unpublished, guest-spoofed and private data excluded');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Here is my public reply.', { exact: true }).waitFor();
  assert.match(await page.title(), /@qa_alice/);
  checks.push('direct profile reload preserves identity and content');
  const posts = page.getByRole('region', { name: 'Posts', exact: true });
  await page.getByRole('button', { name: 'Older posts', exact: true }).click();
  await page.getByRole('button', { name: 'Newer posts', exact: true }).waitFor();
  assert.equal(await posts.locator('article').count(), 2);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'profile-posts-title');
  await page.getByRole('button', { name: 'Newer posts', exact: true }).click();
  await page.getByRole('button', { name: 'Older posts', exact: true }).waitFor();
  assert.equal(await posts.locator('article').count(), 20);
  checks.push('older/newer posts paginate without changing replies');
  const essential = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await essential.isVisible()) await essential.click();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Profile overflow at ' + width);
    await page.screenshot({ path: join(evidence, 'public-profile-' + width + '.png') });
  }
  checks.push('desktop, 390px and 320px profiles fit without overflow and escape post text');
  await page.getByRole('link', { name: 'View reply in conversation', exact: false }).click();
  await page.locator('#reply-' + reply).waitFor();
  assert.equal(new URL(page.url()).hash, '#reply-' + reply);
  await page.locator('#reply-' + reply).getByRole('link', { name: '@qa_alice', exact: true }).click();
  await page.getByText('Here is my public reply.', { exact: true }).waitFor();
  checks.push('reply deep link and thread byline return to the same public profile');
  await page.route('**/api/members/directory?*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Fixture outage"}' }));
  await page.reload();
  await page.getByRole('heading', { name: 'Profile temporarily unavailable', exact: true }).waitFor();
  await page.unroute('**/api/members/directory?*');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByText('Here is my public reply.', { exact: true }).waitFor();
  await page.goto(base + '/members/qa_empty');
  await page.getByText('No public posts or work shared yet.', { exact: true }).waitFor();
  await page.getByText('No public replies yet.', { exact: true }).waitFor();
  await page.goto(base + '/members/no_such_member');
  await page.getByRole('heading', { name: 'Profile not found', exact: true }).waitFor();
  checks.push('503 retry recovers; empty and missing profiles have distinct useful states');
  assert.deepEqual(errors, []);
  checks.push('no uncaught browser errors or framework overlay');
  writeFileSync(join(evidence, 'public-profile-checks.json'), JSON.stringify({ time: new Date().toISOString(), source: process.env.GITHUB_SHA, checks }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally { await browser?.close(); server.kill('SIGTERM'); }
