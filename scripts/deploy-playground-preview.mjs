import {mkdir,writeFile,appendFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {validatePlaygroundPreviewPin,verifyManualPreviewConfig,playgroundPreviewProject as name,playgroundPreviewBranch as branch} from './playground-preview-pin.mjs';
import {verifyPublishedAssets} from './playground-preview-assets.mjs';
import {verifyPublishedRelay} from './playground-preview-relay.mjs';

const env=process.env;
for(const key of ['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','EIDOS_PLAYGROUND_PLATFORM_TOKEN','EIDOS_TEMPLATES_PREVIEW_BYPASS'])if(!env[key])throw Error('Missing isolated preview binding: '+key);
const pin=validatePlaygroundPreviewPin(JSON.parse(await readFile('config/playground-preview.json','utf8')));
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(env.GITHUB_HEAD_REF && env.GITHUB_HEAD_REF!==branch)throw Error('Unexpected pull-request branch.');
const headers={'x-eidos-platform-token':env.EIDOS_PLAYGROUND_PLATFORM_TOKEN,'x-eidos-site-origin':pin.siteOrigin,origin:pin.siteOrigin,'x-vercel-protection-bypass':env.EIDOS_TEMPLATES_PREVIEW_BYPASS};
const configResponse=await fetch(pin.backendUrl+'/api/works/v1/api/public-config',{headers,redirect:'error'});
if(!configResponse.ok)throw Error(`Backend preflight failed (${configResponse.status}).`);
const publicConfig=await configResponse.json();verifyManualPreviewConfig(publicConfig);
if(publicConfig.runtimeSourceRevision!==pin.backendSha || publicConfig.runtimeBundleHash!==pin.bundleHash)throw Error('Backend runtime source and bundle do not match the pin.');
const catalogResponse=await fetch(pin.backendUrl+'/api/works/v1/api/shop/catalog',{headers,redirect:'error'});
if(!catalogResponse.ok)throw Error(`Backend source preflight failed (${catalogResponse.status}).`);
const catalog=await catalogResponse.json();
if(catalog.ready!==false)throw Error('Manual preview commerce must remain disabled.');
const boundaryChecks=[];
for(const document of [{schemaVersion:5,studios:{}},{schemaVersion:1,studios:{}},{schemaVersion:6}]){
  const response=await fetch(pin.backendUrl+'/api/works/v1/api/playground/projects',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({document}),redirect:'error'});
  const result=await response.json();
  if(response.status!==409 || !/JSON backup/.test(result.error||''))throw Error('Backend did not preserve the local-only project boundary.');
  boundaryChecks.push({schemaVersion:document.schemaVersion,status:response.status});
}
for(const [name,extra,status] of [['wrong-relay',{'x-eidos-platform-token':'invalid'},401],['other-origin',{'x-eidos-site-origin':'https://unrelated.pages.dev',origin:'https://unrelated.pages.dev'},403]]){
  const response=await fetch(pin.backendUrl+'/api/works/v1/api/public-config',{headers:{...headers,...extra},redirect:'error'});
  if(response.status!==status)throw Error('Backend did not reject '+name);boundaryChecks.push({name,status});
}
const base=`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/pages/projects`;
async function api(path,method='GET',body,optional=false){
  const response=await fetch(base+path,{method,headers:{authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const result=await response.json();if(optional&&response.status===404)return null;
  if(!result.success)throw Error(`Pages ${method} failed (${response.status}; ${(result.errors||[]).map(e=>e.code).join(',')})`);return result.result;
}
const liveBefore=await api('/eidosworks');let project=await api('/'+name,'GET',undefined,true);
if(!project)project=await api('','POST',{name,production_branch:branch});
if(project.name!==name||project.production_branch!==branch||(project.domains||[]).some(domain=>domain!==name+'.pages.dev'))throw Error('Isolated preview identity guard failed.');
const variables={EIDOS_PLATFORM_URL:{type:'plain_text',value:pin.backendUrl},EIDOS_PLATFORM_TOKEN:{type:'secret_text',value:env.EIDOS_PLAYGROUND_PLATFORM_TOKEN},EIDOS_PLATFORM_PREVIEW_BYPASS:{type:'secret_text',value:env.EIDOS_TEMPLATES_PREVIEW_BYPASS}};
await api('/'+name,'PATCH',{deployment_configs:{production:{env_vars:variables},preview:{env_vars:variables}}});
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');await appendFile('dist/_headers','\n/*\n  X-Robots-Tag: noindex, nofollow\n');
execFileSync(process.platform==='win32'?'npx.cmd':'npx',['wrangler','pages','deploy','dist','--project-name',name,'--branch',branch,'--commit-hash',sha],{stdio:'inherit',env});
project=await api('/'+name);const liveAfter=await api('/eidosworks');
if(liveBefore.latest_deployment?.id!==liveAfter.latest_deployment?.id)throw Error('Canonical deployment changed concurrently; reconcile separately.');
const publishedAssets=await verifyPublishedAssets(pin.siteOrigin,'dist');
let relayReadiness;
try {relayReadiness=await verifyPublishedRelay(pin.siteOrigin,pin);} catch(error) {
  await mkdir('artifacts/playground-unified',{recursive:true});
  const failure={timestamp:new Date().toISOString(),phase:'published-relay-readiness',project:name,branch,siteSha:sha,previewUrl:project.latest_deployment?.url,alias:pin.siteOrigin,backendSha:pin.backendSha,bundleHash:pin.bundleHash,publishedAssets,relayReadiness:error.readiness??{state:'failed',reason:'readiness_configuration_error'},canonicalBefore:liveBefore.latest_deployment?.id,canonicalAfter:liveAfter.latest_deployment?.id};
  await writeFile('artifacts/playground-unified/hosted-preview-failed.json',JSON.stringify(failure,null,2)+'\n');
  throw error;
}
const relayedConfig=relayReadiness.config;
await mkdir('artifacts/playground-unified',{recursive:true});
const receipt={timestamp:new Date().toISOString(),project:name,branch,siteSha:sha,previewUrl:project.latest_deployment?.url,alias:pin.siteOrigin,backendUrl:pin.backendUrl,backendSha:pin.backendSha,backendDeployment:pin.backendDeployment,bundleHash:pin.bundleHash,sourceRevision:pin.sourceRevision,database:pin.database,mode:pin.mode,publicConfig,relayedConfig,relayReadiness,boundaryChecks,publishedAssets,canonicalBefore:liveBefore.latest_deployment?.id,canonicalAfter:liveAfter.latest_deployment?.id};
await writeFile('artifacts/playground-unified/hosted-preview.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
