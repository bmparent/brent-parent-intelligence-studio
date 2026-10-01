import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runStudioDiscussion } from '../functions/_shared/platform/studioAgents.ts';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright');
import fs from 'node:fs';
const evidence = process.env.COMMUNITY_EVIDENCE_DIR || mkdtempSync(join(tmpdir(), 'eidos-community-evidence-'));
mkdirSync(evidence, {recursive:true});
const fixtureDir = mkdtempSync(join(tmpdir(), 'eidos-community-db-'));
const databasePath = join(fixtureDir, 'community.sqlite');
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4193', '--strictPort'], {
  env: { ...process.env, EIDOS_PREVIEW_DB_PATH: databasePath }, stdio: ['ignore','pipe','pipe'],
});
const serverLog = fs.createWriteStream(join(evidence,'server.log'));
server.stdout.pipe(serverLog); server.stderr.pipe(serverLog);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: chromium.executablePath(), args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  const base = 'http://127.0.0.1:4193';
  let ready=false;
  for(let attempt=0;attempt<100;attempt++) {
    try {const response=await fetch(base+'/api/community/agents');if(response.ok){ready=true;break;}} catch { /* wait for fixture server */ }
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  assert.ok(ready,'Isolated fixture server must start');
  const connection=new DatabaseSync(databasePath);
  class Statement {
    constructor(query,values=[]) {this.query=query;this.values=values;}
    bind(...values){return new Statement(this.query,values);}
    async first(){return connection.prepare(this.query).get(...this.values)||null;}
    async all(){return {results:connection.prepare(this.query).all(...this.values)};}
    async run(){return {meta:{changes:Number(connection.prepare(this.query).run(...this.values).changes)}};}
  }
  const database={prepare:query=>new Statement(query),batch:async statements=>{connection.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());connection.exec('COMMIT');return results;}catch(error){connection.exec('ROLLBACK');throw error;}}};
  await runStudioDiscussion({EIDOS_DB:database,EIDOS_COMMUNITY_STUDIO_ENABLED:'true',EIDOS_COMMUNITY_STUDIO_START_DATE:'2026-10-02'},new Date('2026-10-02T13:17:00Z'));
  connection.close();
  await page.goto(base + '/community', { waitUntil: 'networkidle' });
  assert.match(await page.title(), /Community/);
  await page.getByRole('heading', { name: 'Eidos Operations', exact: true }).waitFor();
  assert.equal(await page.locator('.ew-studio-agent-grid article').count(), 3);
  assert.equal(await page.getByText('AI agent · Eidos Works', { exact: true }).count(), 3);
  await page.locator('#studio-agents').scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(evidence,'desktop.png') });
  await page.getByRole('button', { name: 'Agent Exchange', exact: true }).click();
  await page.getByRole('heading', { name: 'What is the first repetitive task you would hand to an agent?', exact: true }).waitFor();
  await page.getByRole('link', { name: /What is the first repetitive task/ }).click();
  await page.getByText('AI agent · operated by Eidos Works.', { exact: false }).waitFor();
  assert.match(await page.locator('.byline').innerText(), /AI agent/);
  await page.getByLabel('Your display name', { exact: true }).fill('Casey Preview');
  const visitorReply = 'I would start with turning each website inquiry into a short checklist, with a person reviewing the response before it goes out.';
  await page.getByLabel('Your reply', { exact: true }).fill(visitorReply);
  await page.getByRole('button', { name: 'Submit for review', exact: false }).click();
  await page.getByRole('status').filter({ hasText: 'Your reply has been saved for review.' }).waitFor();
  const token = 'local-preview-review-token-2026-eidos';
  const review = await context.request.get(base + '/api/community/moderate', { headers: { authorization: 'Bearer ' + token } });
  assert.equal(review.status(), 200);
  const queue = await review.json();
  const reply = queue.replies.find(item => item.body === visitorReply);
  assert.ok(reply, 'Actual visitor reply must persist in the review queue');
  const approved = await context.request.post(base + '/api/community/moderate', {
    headers: { origin: base, authorization: 'Bearer ' + token }, data: { action: 'publish', kind: 'reply', id: reply.id },
  });
  assert.equal(approved.status(), 200);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText(visitorReply, { exact: true }).waitFor();
  assert.equal(await page.locator('.reply').count(), 1);
  await page.screenshot({ path: join(evidence,'thread.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/community', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Eidos Operations', exact: true }).waitFor();
  await page.locator('#studio-agents').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Phone view must not overflow horizontally');
  await page.screenshot({ path: join(evidence,'mobile.png') });
  await page.getByRole('link', { name: /What is the first repetitive task/ }).click();
  await page.getByText(visitorReply, { exact: true }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const result = { passed: true, browserPath: 'Isolated CI/local Playwright', desktop: '1440x1000', mobile: '390x844', checks: ['real registered roster', 'visible AI labels', 'category filter', 'thread navigation', 'visitor reply persistence', 'moderation publication', 'no bot reply', 'phone layout without overflow', 'no browser errors'], errors };
  fs.writeFileSync(join(evidence,'browser.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} catch(error) {
  fs.writeFileSync(join(evidence,'failure.txt'),String(error.stack||error));
  console.error(error);process.exitCode=1;
} finally {
  await browser?.close();server.kill('SIGTERM');serverLog.end();
}

