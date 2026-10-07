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
  const failedResponses = [];
  page.on('response', response => {
    if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() });
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push({ text: msg.text(), location: msg.location() }); });
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
  const essentialOnly = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await essentialOnly.isVisible()) await essentialOnly.click();
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
  await page.getByRole('button', { name: 'Post reply', exact: false }).click();
  await page.getByRole('status').filter({ hasText: 'Your reply is live.' }).waitFor();
  await page.getByText(visitorReply, { exact: true }).waitFor();
  assert.equal(await page.locator('.reply').count(), 1);
  const token = 'local-preview-review-token-2026-eidos';
  const review = await context.request.get(base + '/api/community/moderate', { headers: { authorization: 'Bearer ' + token } });
  assert.equal(review.status(), 200);
  assert.equal((await review.json()).replies.length, 0, 'Published replies never enter the pending queue');
  await page.getByRole('button', { name: 'Reply to Casey Preview', exact: true }).click();
  assert.equal(await page.getByLabel('Your reply', {exact:true}).inputValue(), 'Casey Preview, ');
  await page.getByLabel('Your reply', {exact:true}).fill('Thanks!');
  await page.getByRole('button', {name:'Post reply',exact:false}).click();
  await page.getByText('Thanks!', {exact:true}).waitFor();
  assert.equal(await page.locator('.reply').count(), 2);
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
  assert.equal(errors.length, 0, JSON.stringify({ errors, failedResponses }));
  await page.goto(base + '/community', {waitUntil:'networkidle'});
  await page.getByLabel('Your display name', {exact:true}).fill('Casey Preview');
  await page.getByLabel('A clear title', {exact:true}).fill('How can a small team simplify its website?');
  await page.locator('#ask').getByLabel('Your question', {exact:true}).fill('Which part of a website should a small team simplify first, and why?');
  await page.getByRole('button', {name:'Post conversation',exact:false}).click();
  await page.getByRole('link', {name:'Open your conversation',exact:false}).waitFor();
  await page.getByRole('heading', {name:'How can a small team simplify its website?',exact:true}).waitFor();
  await page.getByRole('link', {name:'Open your conversation',exact:false}).click();
  const humanThreadId = new URL(page.url()).pathname.split('/').at(-1);
  const agentResponse = await context.request.post(base + '/api/community/moderate', {
    headers:{origin:base,authorization:'Bearer '+token},
    data:{action:'register-agent',name:'Browser QA Agent',profileUrl:'https://example.com/qa-operator'},
  });
  const agent = await agentResponse.json();
  const agentBody = 'An agent can help identify the most-used path. <img src=x onerror=alert(1)> is untrusted example text.';
  const agentReply = await context.request.post(base + '/api/community/agents', {
    headers:{authorization:'Bearer '+agent.key},data:{threadId:humanThreadId,body:agentBody},
  });
  assert.equal(agentReply.status(),201);
  assert.equal((await agentReply.json()).state,'published');
  await page.getByText(agentBody,{exact:true}).waitFor({timeout:35000});
  assert.match(await page.locator('.reply .eyebrow').innerText(),/AI agent/);
  assert.equal(await page.locator('#reply-list img').count(),0,'Live user HTML must remain text');
  await page.getByRole('button',{name:'Reply to Browser QA Agent',exact:true}).click();
  assert.equal(await page.getByLabel('Your reply',{exact:true}).inputValue(),'Browser QA Agent, ');
  assert.equal(await page.getByLabel('Your reply',{exact:true}).evaluate(element=>element===document.activeElement),true);
  await page.getByLabel('Your reply',{exact:true}).fill('Thanks for joining!');
  await page.getByRole('button',{name:'Post reply',exact:false}).click();
  await page.getByText('Thanks for joining!',{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:join(evidence,'mobile-live-conversation.png')});
  assert.equal(errors.length,0,JSON.stringify({errors,failedResponses}));
  const result = { passed: true, browserPath: 'Isolated CI/local Playwright', desktop: '1440x1000', mobile: '390x844', checks: ['real registered roster', 'visible AI labels', 'category filter', 'thread navigation', 'immediate visitor reply', 'no pending review', 'one-click reply focus', 'short replies', 'immediate human discussion and list refresh', 'agent reply in human community', 'live update without reload', 'safe HTML text', 'phone layout without overflow', 'no browser errors'], errors };
  fs.writeFileSync(join(evidence,'browser.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} catch(error) {
  fs.writeFileSync(join(evidence,'failure.txt'),String(error.stack||error));
  console.error(error);process.exitCode=1;
} finally {
  await browser?.close();server.kill('SIGTERM');serverLog.end();
}
