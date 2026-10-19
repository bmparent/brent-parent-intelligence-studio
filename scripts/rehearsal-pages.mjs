import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const account='ae4f6116c302b50dd1efe0e6a65caaf9',project='eidosworks-playground-rehearsal-20261017',branch='rehearsal-disabled';
export const origin=`https://${branch}.${project}.pages.dev`;
export const backend='https://eidos-sentinel-qmgqp584s-1brentbm-1876s-projects.vercel.app';
export const backendSha='f16bd3a94ae8a3a49065baac4c4d7ccfd5da1be7',bundleHash='9c214c53674ee42b2536bec35c9ba92a7d60b0d8b7b0acf716c69922507ff911';
export const flags=['EIDOS_AI_ENABLED','EIDOS_PLAYGROUND_AI_ENABLED','EIDOS_SHOP_ENABLED','EIDOS_TEMPLATE_LIVE_ENABLED','EIDOS_PLAYGROUND_DELIVERY_LIVE_ENABLED','EIDOS_TEMPLATE_TEST_ENABLED','EIDOS_TEMPLATE_TEST_CHALLENGE','EIDOS_ACCOUNTS_ENABLED','EIDOS_LOCAL_TEST','EIDOS_PROACTIVE_ENABLED','EIDOS_COMMUNITY_STUDIO_ENABLED','EIDOS_NEWSLETTER_ENABLED'];
export function validateProject(p) {
 assert.equal(p.name,project);assert.equal(p.production_branch,'main');
 assert.deepEqual((p.domains||[]).filter(x=>x!==project+'.pages.dev'),[],'Custom domains forbidden');
 const c=p.deployment_configs?.preview;assert.ok(c,'Preview configuration required');
 assert.equal(c.compatibility_date,'2026-10-01');assert.deepEqual(c.compatibility_flags||[],[]);assert.equal(c.fail_open,false);
 const e=c.env_vars||{};
 for(const key of flags)assert.equal(e[key]?.value,'false',key);
 for(const key of ['EIDOS_PLAYGROUND_AI_MODE','EIDOS_PLAYGROUND_DELIVERY_MODE'])assert.equal(e[key]?.value,'disabled',key);
 assert.equal(e.EIDOS_DATABASE_BINDING_PREFIX?.value,'EIDOS_PG_INTEGRATION');assert.equal(e.EIDOS_PLATFORM_URL?.value,backend);
 for(const key of ['EIDOS_PLATFORM_TOKEN','EIDOS_PLATFORM_PREVIEW_BYPASS'])assert.equal(e[key]?.type,'secret_text',key);
 for(const key of ['kv_namespaces','d1_databases','r2_buckets','services','ai_bindings','durable_object_namespaces','queue_producers','vectorize_bindings'])assert.equal(Object.keys(c[key]||{}).length,0,'Unexpected binding '+key);
 assert.deepEqual(Object.keys(e).sort(),[...flags,'EIDOS_PLAYGROUND_AI_MODE','EIDOS_PLAYGROUND_DELIVERY_MODE','EIDOS_DATABASE_BINDING_PREFIX','EIDOS_PLATFORM_URL','EIDOS_PLATFORM_TOKEN','EIDOS_PLATFORM_PREVIEW_BYPASS'].sort());
 return {project,productionBranch:p.production_branch,customDomains:[],compatibilityDate:c.compatibility_date,failOpen:c.fail_open,previewVariableNames:Object.keys(e).sort(),capabilities:'disabled'};
}
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));return value;}
function fingerprint(p){return createHash('sha256').update(JSON.stringify(stable(p.deployment_configs))).digest('hex');}
async function provider(suffix='') {
 assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID,account,'Unexpected authenticated account');assert.ok(process.env.CLOUDFLARE_API_TOKEN);
 const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}${suffix}`,{headers:{Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`}});
 assert.equal(r.ok,true,'Dedicated project read failed');const b=await r.json();assert.equal(b.success,true,'Provider did not confirm project');return b.result;
}
async function main(mode) {
 const out=process.env.REHEARSAL_EVIDENCE_DIR;assert.ok(out);const p=await provider();const identity=validateProject(p);
 const receiptPath=path.join(out,'pages-preflight.json');
 if(mode==='preflight') {
   const existing=await provider('/deployments');
   assert.equal(existing.some(d=>d.environment==='preview'&&d.deployment_trigger?.metadata?.branch===branch&&d.latest_stage?.status==='success'),false,'Reconcile existing successful rehearsal before another upload');
   const receipt={...identity,account,checkedAt:new Date().toISOString(),configurationFingerprint:fingerprint(p),productionCanonicalId:p.canonical_deployment?.id||null,uploadBuildCommit:'8e3ed6c0470fa696452380a9981b794eacc02c5b',reviewedFrontendHead:'4505148c71dc06e17c3cc5359fc628d836d20410',deploymentEnvironment:'preview',branch};
   await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));return;
 }
 assert.equal(mode,'verify');const before=JSON.parse(await readFile(receiptPath,'utf8'));
 assert.equal(fingerprint(p),before.configurationFingerprint,'Configuration changed during upload');assert.equal(p.canonical_deployment?.id||null,before.productionCanonicalId,'Dedicated Production canonical deployment changed');
 const deployments=await provider('/deployments');
 const d=deployments.find(d=>d.environment==='preview'&&d.deployment_trigger?.metadata?.branch===branch&&d.deployment_trigger?.metadata?.commit_hash===before.uploadBuildCommit&&d.latest_stage?.status==='success');
 assert.ok(d,'No exact successful Preview deployment');assert.ok(d.aliases?.some(x=>x===origin||'https://'+x===origin),'Expected branch alias was not issued by provider');
 const configResponse=await fetch(origin+'/api/public-config',{redirect:'manual',cache:'no-store'});assert.equal(configResponse.status,200);const config=await configResponse.json();
 for(const key of ['accountsReady','communityReady','aiReady','playgroundAiReady','shopReady','localTest'])assert.equal(config[key],false,key);
 assert.equal(config.gaMeasurementId,'');assert.equal(config.runtimeSourceRevision,backendSha);assert.equal(config.runtimeBundleHash,bundleHash);
 const payload=JSON.parse(await readFile(path.join(out,'payload-inventory.json'),'utf8'));
 const html=await fetch(origin+'/playground/',{redirect:'manual',cache:'no-store'});assert.equal(html.status,200);const content=await html.text();
 const assetPaths=[...content.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(m=>m[1]);assert.ok(assetPaths.length);
 const assets=[];
 for(const assetPath of [...new Set(assetPaths)]){const expected=payload.files.find(x=>'/'+x.path===assetPath);assert.ok(expected);const r=await fetch(origin+assetPath,{redirect:'manual',cache:'no-store'});assert.equal(r.status,200);const digest=createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');assert.equal(digest,expected.sha256);assets.push({path:assetPath,sha256:digest});}
 const denials=[];
 for(const route of ['ai','checkout','delivery']){const r=await fetch(origin+'/api/playground/'+route,{method:'POST',headers:{origin,'content-type':'application/json','x-eidos-platform-token':'browser-forgery','x-vercel-protection-bypass':'browser-forgery'},body:'{}',redirect:'manual'});assert.equal(r.status,503);denials.push({route,status:r.status,body:await r.json()});}
 const wrongOrigin=await fetch(origin+'/api/playground/checkout',{method:'POST',headers:{origin:'https://unrelated.example','content-type':'application/json'},body:'{}',redirect:'manual'});assert.equal(wrongOrigin.status,403);
 const receipt={...identity,account,verifiedAt:new Date().toISOString(),deploymentId:d.id,immutableUrl:d.url,branchUrl:origin,environment:d.environment,branch,originalBuildCommit:before.uploadBuildCommit,reviewedFrontendHead:before.reviewedFrontendHead,backendSha,bundleHash,configurationUnchanged:true,dedicatedProductionUnchanged:true,publicConfig:config,entryAssets:assets,disabledDenials:denials,wrongOriginStatus:wrongOrigin.status,kind:'Actual hosted Pages relay acceptance; accounts and paid flows remain disabled'};
 await writeFile(path.join(out,'hosted-pair.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv[2]);
