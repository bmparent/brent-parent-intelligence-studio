import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyPublishedAssets } from './playground-preview-assets.mjs';
export const testProject='eidosworks-playground-test-20261015', testBranch='codex/playground-unified-20261014', testOrigin=`https://${testProject}.pages.dev`;
export function validateTestPin(pin) {
  if(pin?.project!==testProject||pin.branch!==testBranch||pin.siteOrigin!==testOrigin||pin.mode!=='test'||pin.database!=='approved-test-validation')throw Error('Expected the isolated Playground TEST candidate.');
  const url=new URL(pin.backendUrl);
  if(url.protocol!=='https:'||!/^eidos-sentinel-[a-z0-9]+-1brentbm-1876s-projects\.vercel\.app$/.test(url.hostname)||url.pathname!=='/'||url.port||url.username||url.password||url.search||url.hash)throw Error('Expected the exact protected Preview backend.');
  if(!/^[a-f0-9]{40}$/.test(pin.backendSha)||!/^[a-f0-9]{64}$/.test(pin.bundleHash)||!/^dpl_[a-zA-Z0-9]+$/.test(pin.backendDeployment)||pin.sourceRevision!==pin.backendSha+'-bundle-'+pin.bundleHash.slice(0,16))throw Error('Exact source identities are required.');
  return pin;
}
export function verifyTestConfig(config,pin) {
  for(const flag of ['accountsReady','shopReady'])if(config?.[flag]!==true)throw Error('TEST candidate requires '+flag+'=true.');
  for(const flag of ['communityReady','aiReady','playgroundAiReady','localTest'])if(config?.[flag]!==false)throw Error('Unexpected TEST feature: '+flag);
  if(config.runtimeSourceRevision!==pin.backendSha||config.runtimeBundleHash!==pin.bundleHash||config.turnstileSiteKey!=='1x00000000000000000000AA')throw Error('TEST candidate runtime differs from its reviewed pin.');
}
async function main() {
  const env=process.env, pin=validateTestPin(JSON.parse(await readFile('config/playground-test-preview.json','utf8')));
  const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  if(env.GITHUB_REF!=='refs/heads/'+testBranch)throw Error('Deploy only by manual dispatch from the isolated Playground branch.');
  for(const name of ['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','EIDOS_PLAYGROUND_PLATFORM_TOKEN','EIDOS_TEMPLATES_PREVIEW_BYPASS'])if(!env[name])throw Error('Missing isolated binding: '+name);
  const headers={'x-eidos-platform-token':env.EIDOS_PLAYGROUND_PLATFORM_TOKEN,'x-eidos-site-origin':testOrigin,'origin':testOrigin,'x-vercel-protection-bypass':env.EIDOS_TEMPLATES_PREVIEW_BYPASS};
  const config=await fetch(pin.backendUrl+'/api/works/v1/api/public-config',{headers,redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!config.ok)throw Error('Backend TEST preflight rejected ('+config.status+').');
  const data=await config.json();verifyTestConfig(data,pin);
  const catalogResponse=await fetch(pin.backendUrl+'/api/works/v1/api/shop/catalog',{headers,redirect:'error',signal:AbortSignal.timeout(20000)});
  const catalog=await catalogResponse.json();
  const packagedEditions=catalog.editions?.filter(e=>['developer','wordpress'].includes(e.editionId));
  if(!catalogResponse.ok||catalog.ready!==true||catalog.mode!=='test'||catalog.sourceRevision!==pin.sourceRevision||packagedEditions?.length!==8||
      packagedEditions.some(e=>e.status==='package_missing')||packagedEditions.filter(e=>e.editionId==='developer'&&e.available===true).length!==4)throw Error('The immutable TEST catalog is incomplete.');
  const base=`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/pages/projects`;
  const api=async(suffix,method='GET',body,optional=false)=>{
    const r=await fetch(base+suffix,{method,redirect:'error',headers:{authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    const value=await r.json();if(optional&&r.status===404)return null;
    if(!value.success)throw Error('Pages TEST operation failed ('+r.status+').');return value.result;
  };
  const liveBefore=await api('/eidosworks');let project=await api('/'+testProject,'GET',undefined,true);
  if(!project)project=await api('','POST',{name:testProject,production_branch:testBranch});
  if(project.name!==testProject||project.production_branch!==testBranch||(project.domains||[]).some(d=>d!==testProject+'.pages.dev'))throw Error('Unexpected Pages project identity.');
  const variables={EIDOS_PLATFORM_URL:{type:'plain_text',value:pin.backendUrl},EIDOS_PLATFORM_TOKEN:{type:'secret_text',value:env.EIDOS_PLAYGROUND_PLATFORM_TOKEN},EIDOS_PLATFORM_PREVIEW_BYPASS:{type:'secret_text',value:env.EIDOS_TEMPLATES_PREVIEW_BYPASS}};
  await api('/'+testProject,'PATCH',{deployment_configs:{production:{env_vars:variables},preview:{env_vars:variables}}});
  await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');await appendFile('dist/_headers','\n/*\n  X-Robots-Tag: noindex, nofollow\n');
  execFileSync(process.platform==='win32'?'npx.cmd':'npx',['wrangler','pages','deploy','dist','--project-name',testProject,'--branch',testBranch,'--commit-hash',sha],{stdio:'inherit',env});
  project=await api('/'+testProject);const liveAfter=await api('/eidosworks');
  if(liveBefore.latest_deployment?.id!==liveAfter.latest_deployment?.id)throw Error('Canonical deployment changed concurrently; reconcile separately.');
  const assets=await verifyPublishedAssets(testOrigin,'dist');
  let publicConfig,history=[];
  for(let i=0;i<12;i++) {
    const r=await fetch(testOrigin+'/api/public-config',{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)});
    history.push({attempt:i+1,status:r.status});
    if(r.ok){const value=await r.json();if(value.runtimeSourceRevision===pin.backendSha&&value.runtimeBundleHash===pin.bundleHash){verifyTestConfig(value,pin);publicConfig=value;break;}}
    if(i<11)await new Promise(resolve=>setTimeout(resolve,2000));
  }
  if(!publicConfig)throw Error('Published TEST relay did not reach the exact source.');
  const boundary=[];
  for(const [route,method,status] of [['/api/playground/delivery','GET',401],['/api/playground/ai','GET',401],['/api/shop/webhook','POST',400]]) {
    const r=await fetch(testOrigin+route,{method,redirect:'error',...(method==='POST'?{body:'{}',headers:{'content-type':'application/json'}}:{})});
    boundary.push({route,status:r.status});if(r.status!==status)throw Error('Hosted TEST authentication/signature boundary failed.');
  }
  const receipt={timestampUtc:new Date().toISOString(),project:testProject,branch:testBranch,siteSha:sha,previewUrl:project.latest_deployment?.url,alias:testOrigin,
    ...pin,publicConfig,catalog,assets,relayHistory:history,boundary,canonicalBefore:liveBefore.latest_deployment?.id,canonicalAfter:liveAfter.latest_deployment?.id};
  await mkdir('artifacts/playground-unified/test-release',{recursive:true});await writeFile('artifacts/playground-unified/test-release/hosted-test-preview.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({published:true,alias:testOrigin,siteSha:sha,backendSha:pin.backendSha,canonicalUnchanged:true}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Isolated TEST preview deployment failed; private details suppressed.');process.exitCode=1;});
