import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GROWTH_BASE_URL||'http://127.0.0.1:8788';
const output=process.env.GROWTH_EVIDENCE_DIR||'artifacts/growth/phase1-20260920/browser-local';
const local=base.startsWith('http://127.0.0.1');const submit=local||process.env.GROWTH_QA_SUBMIT==='1';
await mkdir(output,{recursive:true});const results=[];
for(const [engine,width,height] of [['chromium',1440,1000],['webkit',390,844]]) {
  const browser=await pw[engine].launch({headless:true});const errors=[],events=[];
  try {
    const context=await browser.newContext({viewport:{width,height},...(engine==='webkit'?{isMobile:true,hasTouch:true}:{}),extraHTTPHeaders:{'x-eidos-qa':'automation'}});
    // Local acceptance isolates the third-party tag; production acceptance uses the actual tag.
    if(local)await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({status:200,body:''}));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error' && !(m.text().includes('404') && m.location().url.includes('/growth-nonexistent-page')))errors.push(m.text());});
    page.on('request',r=>{if(r.url().includes('/api/growth/events')&&r.method()==='POST')events.push(r.postDataJSON());});
    const visit=async path=>{const r=await page.goto(base+path,{waitUntil:'load'});assert.ok(r.ok(),`${path} HTTP ${r.status()}`);await page.waitForFunction(()=>document.documentElement.dataset.eidosClientReady==='true');await page.locator('h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${engine} ${path} overflow`);};
    await visit('/?eidos_qa=1');assert.equal(events.length,0,'No telemetry before consent');
    await page.getByRole('button',{name:'Essential only',exact:true}).click();
    await visit('/central-florida?utm_source=linkedin&utm_medium=organic_social&utm_campaign=phase1_friction_review&utm_content=founder_launch&eidos_qa=1&private=must_not_collect');
    assert.equal(events.length,0,'Denied consent emitted analytics');
    // Reopen actual consent control through its visible footer link.
    await page.getByRole('button',{name:'Cookie choices',exact:true}).click();
    const [accepted]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/growth/events')&&r.request().method()==='POST'),page.getByRole('button',{name:'Allow analytics',exact:true}).click()]);
    assert.equal(accepted.status(),200,'Growth collector did not accept the consented event');
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`${output}/${engine}-central-florida.png`,fullPage:true});
    await page.getByRole('link',{name:'Get a Friction Review →',exact:true}).first().click();
    await page.waitForURL(/\/friction-review\/?$/);await page.waitForFunction(()=>document.documentElement.dataset.eidosClientReady==='true');
    const form=page.locator('.ew-friction-form');await form.locator('input[autocomplete="name"]').fill('Eidos Works QA');
    await form.locator('input[autocomplete="email"]').fill('projects@eidos-works.com');
    await form.locator('textarea').first().fill('Eidos Works QA: controlled growth release validation. This is not a customer lead.');
    await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement!==document.body),'Keyboard focus missing');
    if(submit && (local||engine==='chromium')) {
      const [r]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/project-inquiries')&&r.request().method()==='POST'),form.getByRole('button',{name:'Send the Friction →'}).click()]);
      const sent=r.request().postDataJSON(),body=await r.json();assert.equal(body.submitted,true);assert.equal(body.measurementRecorded,true);assert.equal(sent.landingPage,'/central-florida');assert.equal(sent.utmSource,'linkedin');
      await page.getByText('Got it. We’ll take a look.',{exact:true}).waitFor();
      await writeFile(`${output}/${engine}-inquiry-proof.json`,JSON.stringify({providerAcknowledged:body.submitted,measurementRecorded:body.measurementRecorded,qa:true,source:sent.utmSource,landing:sent.landingPage},null,2));
    }
    await page.screenshot({path:`${output}/${engine}-friction.png`,fullPage:true});
    assert.ok(events.some(e=>e.event==='friction_cta_click'));assert.ok(events.some(e=>e.event==='friction_form_start'));
    assert.ok(events.every(e=>e.qa===true));assert.ok(!JSON.stringify(events).includes('must_not_collect'));
    await visit('/services/business-systems');await page.screenshot({path:`${output}/${engine}-service.png`,fullPage:true});
    await visit('/?eidos_qa=1');await page.screenshot({path:`${output}/${engine}-home.png`,fullPage:false});
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'load'});assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const hero=await page.locator('.ew-cinema').count();
    assert.equal(hero,1);
    const notFound=await page.goto(base+'/growth-nonexistent-page',{waitUntil:'load'});
    assert.equal(notFound.status(),404);
    await page.getByRole('heading',{level:1,name:'That page does not exist.'}).waitFor();
    assert.deepEqual(errors,[],`${engine} browser errors`);
    results.push({engine,viewport:{width,height},passed:true,events:events.map(e=>({event:e.event,path:e.path,qa:e.qa,attribution:e.attribution})),consoleErrors:errors,heroElements:hero,reducedMotion:true,qaSubmission:submit&&(local||engine==='chromium')});
  }catch(error){results.push({engine,passed:false,error:String(error),consoleErrors:errors});throw error;}
  finally{await browser.close();await writeFile(`${output}/acceptance.json`,JSON.stringify({base,controlled:local,results},null,2));}
}
console.log('Growth desktop Chromium and mobile WebKit acceptance passed.');
