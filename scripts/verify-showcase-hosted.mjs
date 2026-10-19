import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const pin=JSON.parse(await readFile('config/showcase-preview.json','utf8'));
const deployed=JSON.parse(await readFile(process.env.SHOWCASE_DEPLOYMENT_RECEIPT||'artifacts/showcase/hosted-preview.json','utf8'));
assert.equal(pin.backendSha,deployed.backendSha);assert.equal(pin.siteOrigin,deployed.alias);
const origin=deployed.alias,checks=[];
for(const [route,heading] of [['/playground','Eidos Playground'],['/shop/configure?family=matter','Choose a direction'],['/work/signal-house','Signal House']]){
 const response=await fetch(origin+route),html=await response.text();assert.equal(response.status,200);assert.ok(html.includes(heading));assert.match(response.headers.get('x-robots-tag')||'',/noindex/);checks.push({route,url:response.url,status:response.status,correctPrerender:true,noindex:true});
}
const [alias,immutable]=await Promise.all([fetch(origin+'/work/signal-house/'),fetch(deployed.previewUrl+'/work/signal-house/')]);
const [aliasHtml,immutableHtml]=await Promise.all([alias.text(),immutable.text()]);
const assets=html=>[...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(m=>m[1]).sort();
assert.deepEqual(assets(aliasHtml),assets(immutableHtml));const hashes=[];
for(const asset of assets(aliasHtml)){
 const results=await Promise.all([origin,deployed.previewUrl].map(async base=>{const r=await fetch(base+asset);assert.equal(r.status,200);return createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');}));assert.equal(results[0],results[1]);hashes.push({asset,sha256:results[0]});
}
const configResponse=await fetch(origin+'/api/public-config'),config=await configResponse.json();assert.equal(configResponse.status,200);
for(const key of ['accountsReady','aiReady','shopReady'])assert.equal(config[key],false);
checks.push({route:'/api/public-config',status:200,accountsReady:false,aiReady:false,shopReady:false});
for(const document of [{schemaVersion:5},{schemaVersion:1,studios:{}},{schemaVersion:99}]){
 const response=await fetch(origin+'/api/playground/projects',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({document})});const result=await response.json();assert.equal(response.status,409);assert.match(result.error,/saved on this device/);checks.push({route:'/api/playground/projects',schemaVersion:document.schemaVersion,hasStudios:'studios' in document,status:response.status,localBackupNotice:true});
}
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,args:['--disable-gpu']});
await mkdir('artifacts/showcase/hosted',{recursive:true});
const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await noScript.newPage();
await page.goto(origin+'/work/signal-house');assert.match(await page.locator('h1').innerText(),/Signal House/);assert.ok(await page.getByRole('link',{name:/Try Effect Studio/}).count());assert.ok(await page.locator('svg').count());await page.screenshot({path:'artifacts/showcase/hosted/case-study-no-script.png'});checks.push({route:'/work/signal-house',environment:'Chromium 390px, JavaScript disabled',semanticStoryAndScene:true,finalAction:true});await noScript.close();
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),performancePage=await context.newPage();const started=Date.now();await performancePage.goto(origin+'/playground?studio=effect');await performancePage.locator('.studio-app').waitFor();
const measurement={navigationToStudioVisibleMs:Date.now()-started,...await performancePage.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:n.domContentLoadedEventEnd,responseEndMs:n.responseEnd};}),context:'One Windows Chromium headless navigation at1440x1000, GPU disabled, reduced motion. Network/machine dependent observation, not a performance benchmark.'};
await performancePage.screenshot({path:'artifacts/showcase/hosted/effect-studio-desktop.png'});await context.close();await browser.close();
await writeFile('artifacts/showcase/hosted/paired-acceptance.json',JSON.stringify({timestamp_utc:new Date().toISOString(),deployment:deployed,checks,compiledAssetHashes:hashes,measurement,sourceIdentity:'Wrangler commit-hash and immutable Pages deployment receipt; alias and immutable compiled assets read back with equal SHA256',providerAcceptance:'Disabled-provider facts and local-format rejection verified; account/AI/paid functionality remains held',physicalDevice:false},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,alias:origin,immutable:deployed.previewUrl,siteSha:deployed.siteSha,backendSha:deployed.backendSha,measurement}));
