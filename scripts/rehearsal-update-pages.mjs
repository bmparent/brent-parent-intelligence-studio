import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {account,project,branch,origin,backendSha,bundleHash,validateProject} from './rehearsal-pages.mjs';
import {predecessor,validatePredecessor,validateReplacement} from './rehearsal-update-predecessor.mjs';
function stable(v){return Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;}
function fingerprint(p){return createHash('sha256').update(JSON.stringify(stable(p.deployment_configs))).digest('hex');}
async function provider(suffix=''){
 assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID,account);assert.ok(process.env.CLOUDFLARE_API_TOKEN);
 const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}${suffix}`,{headers:{Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`}});
 assert.equal(response.ok,true,'Dedicated provider read failed');const value=await response.json();assert.equal(value.success,true);return value.result;
}
export function validateRuntimeConfig(config){
 for(const key of ['accountsReady','communityReady','aiReady','playgroundAiReady','shopReady','localTest'])assert.equal(config[key],false,key);
 assert.equal(config.gaMeasurementId,'');assert.equal(config.runtimeSourceRevision,backendSha);assert.equal(config.runtimeBundleHash,bundleHash);
 return config;
}
async function readRuntimeConfig(){
 const response=await fetch(origin+'/api/public-config',{redirect:'manual',cache:'no-store'});assert.equal(response.status,200);
 return validateRuntimeConfig(await response.json());
}
async function main(mode){
 const out=process.env.REHEARSAL_EVIDENCE_DIR;assert.ok(out);
 const lock=JSON.parse(await readFile(new URL('../config/rehearsal-tutorial-artifact-lock.json',import.meta.url),'utf8'));
 assert.equal(lock.frontendSha,'3c09fa425f3f41f40ae89d9ea6116cf3200a91d7');assert.equal(lock.baseSha,'4505148c71dc06e17c3cc5359fc628d836d20410');
 const p=await provider(),identity=validateProject(p),receiptPath=path.join(out,'pages-preflight.json');
 if(mode==='preflight'){
  const previous=validatePredecessor(await provider('/deployments'),lock.buildCommit);
  const publicConfig=await readRuntimeConfig();
  const receipt={...identity,account,previous,checkedAt:new Date().toISOString(),configurationFingerprint:fingerprint(p),productionCanonicalId:p.canonical_deployment?.id||null,uploadBuildCommit:lock.buildCommit,reviewedFrontendHead:lock.frontendSha,sourceTree:lock.sourceTree,artifactId:lock.artifactId,artifactDigest:lock.digest,deploymentEnvironment:'preview',branch,publicConfig};
  await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));return;
 }
 assert.equal(mode,'verify');const before=JSON.parse(await readFile(receiptPath,'utf8'));
 assert.equal(before.previous.id,predecessor.id);assert.equal(before.uploadBuildCommit,lock.buildCommit);assert.equal(before.reviewedFrontendHead,lock.frontendSha);
 assert.equal(fingerprint(p),before.configurationFingerprint,'Provider configuration changed during upload');assert.equal(p.canonical_deployment?.id||null,before.productionCanonicalId,'Dedicated Production identity changed');
 const deployments=await provider('/deployments');
 const d=validateReplacement(deployments,lock.buildCommit,before.checkedAt);
 const config=await readRuntimeConfig();
 const payload=JSON.parse(await readFile(path.join(out,'payload-inventory.json'),'utf8'));assert.equal(payload.reviewedHead,lock.frontendSha);assert.equal(payload.buildCommit,lock.buildCommit);
 const html=await fetch(origin+'/playground/',{redirect:'manual',cache:'no-store'});assert.equal(html.status,200);const content=await html.text();
 const paths=[...new Set([...content.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(m=>m[1]))];assert.ok(paths.length);
 const assets=[];
 for(const assetPath of paths){const expected=payload.files.find(f=>'/'+f.path===assetPath);assert.ok(expected);const r=await fetch(origin+assetPath,{redirect:'manual',cache:'no-store'});assert.equal(r.status,200);const digest=createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');assert.equal(digest,expected.sha256);assets.push({path:assetPath,sha256:digest});}
 const denials=[];
 for(const route of ['ai','checkout','delivery']){const r=await fetch(origin+'/api/playground/'+route,{method:'POST',headers:{origin,'content-type':'application/json','x-eidos-platform-token':'browser-forgery','x-vercel-protection-bypass':'browser-forgery'},body:'{}',redirect:'manual'});assert.equal(r.status,503);denials.push({route,status:r.status,body:await r.json()});}
 const wrongOrigin=await fetch(origin+'/api/playground/checkout',{method:'POST',headers:{origin:'https://unrelated.example','content-type':'application/json'},body:'{}',redirect:'manual'});assert.equal(wrongOrigin.status,403);
 const receipt={...identity,account,verifiedAt:new Date().toISOString(),deploymentId:d.id,immutableUrl:d.url,branchUrl:origin,environment:d.environment,branch,previousDeploymentId:predecessor.id,buildCommit:lock.buildCommit,reviewedFrontendHead:lock.frontendSha,sourceTree:lock.sourceTree,artifactId:lock.artifactId,artifactDigest:lock.digest,retainedWorkerSourceCommit:lock.baseSha,retainedWorkerSha256:payload.workerSha256,backendSha,bundleHash,configurationUnchanged:true,dedicatedProductionUnchanged:true,publicConfig:config,entryAssets:assets,disabledDenials:denials,wrongOriginStatus:wrongOrigin.status,kind:'Actual hosted acceptance of new PR128 frontend with unchanged Functions/backend; accounts and paid flows disabled'};
 await writeFile(path.join(out,'hosted-pair.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv[2]);
