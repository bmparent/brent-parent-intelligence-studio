import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SHOWCASE_BASE || 'http://127.0.0.1:5178';
const out = path.resolve(process.env.SHOWCASE_EVIDENCE || 'artifacts/showcase/legacy-imports');
await mkdir(out, { recursive: true });
const fixtures = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `
import {createProject,upgradeProject,validateProject,LEGACY_RENDERER} from './src/playground/model.ts';
import {enableComposition} from './src/playground/composition.ts';
import {enableBlocks} from './src/playground/authoring.ts';
const p=createProject();
console.log(JSON.stringify([p,{...p,rendererVersion:LEGACY_RENDERER},upgradeProject(p),enableComposition(p),enableBlocks(p)].map((p,i)=>validateProject({...p,name:'Legacy import '+i}))));
`], { encoding: 'utf8' }));
await writeFile(path.join(out, 'legacy-fixtures.json'), JSON.stringify(fixtures, null, 2));
const receipt = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), base, platform: process.platform, timestampUtc: new Date().toISOString(), checks: [], errors: [] };
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
receipt.browserVersion = browser.version();
try {
  for (const fixture of fixtures) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage(); page.on('dialog', d => d.accept()); page.on('pageerror', e => receipt.errors.push(e.message));
    try {
      await page.goto(base + '/playground/'); await page.locator('.pg-app').waitFor();
      await page.getByLabel('Import project', { exact: true }).setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
      await page.locator('.pg-toast').filter({ hasText: 'Project imported' }).waitFor();
      const details = page.locator('.pg-project-tools').filter({ has: page.getByLabel('Import project', { exact: true }) }); await details.locator('summary').click();
      const pending = page.waitForEvent('download'); await details.getByRole('button', { name: 'Download project JSON', exact: true }).click(); const downloaded = await pending;
      const chunks = []; for await (const chunk of await downloaded.createReadStream()) chunks.push(chunk);
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString('utf8')), fixture);
      await page.getByLabel('Studio', { exact: true }).selectOption('effect'); await page.locator('.studio-app').waitFor();
      const migrated = await page.evaluate(() => window.eidosPlayground.read().project);
      assert.equal(migrated.schemaVersion, 5); assert.equal(migrated.rendererVersion, fixture.rendererVersion);
      // Explicit migration materializes the legacy ID-derived section type.
      assert.deepEqual(migrated.sections, fixture.sections.map(section => ({ ...section, type: section.type || section.id }))); assert.deepEqual(migrated.brand, fixture.brand); assert.deepEqual(migrated.glass, fixture.glass);
      await page.getByRole('button', { name: 'Save locally', exact: true }).click(); await page.locator('.studio-save').filter({ hasText: 'Saved on this device' }).waitFor();
      await page.reload(); await page.locator('.studio-app').waitFor(); assert.deepEqual(await page.evaluate(() => window.eidosPlayground.read().project), migrated);
      receipt.checks.push({ sourceVersion: fixture.schemaVersion, renderer: fixture.rendererVersion, name: fixture.name, status: 'passed', importedSourceUnchanged: true, explicitStudioMigration: 5, rendererSectionBrandGlassPreserved: true, savedReopened: true });
    } finally { await context.close(); }
  }
} catch (error) { receipt.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2)); }
if (receipt.errors.length) process.exitCode = 1;
console.log(JSON.stringify({ passed: receipt.checks.length, failure: receipt.failure, runtimeErrors: receipt.errors, receipt: path.join(out, 'receipt.json') }));
