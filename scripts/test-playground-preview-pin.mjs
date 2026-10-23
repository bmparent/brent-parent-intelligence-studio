import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePlaygroundPreviewPin,verifyManualPreviewConfig,playgroundPreviewProject,playgroundPreviewBranch,playgroundPreviewOrigin} from './playground-preview-pin.mjs';
import {verifyPublishedRelay} from './playground-preview-relay.mjs';
const pin={project:playgroundPreviewProject,branch:playgroundPreviewBranch,siteOrigin:playgroundPreviewOrigin,mode:'manual-only',backendUrl:'https://fixture.vercel.app',backendSha:'a'.repeat(40),bundleHash:'b'.repeat(64),sourceRevision:'a'.repeat(40)+'-bundle-'+'b'.repeat(16),backendDeployment:'dpl_fixture',database:'none'};
test('isolated manual preview refuses production, unpinned bundles, credential URLs and persistent bindings',()=>{
  assert.equal(validatePlaygroundPreviewPin(pin),pin);
  for(const change of [{project:'eidosworks'},{branch:'main'},{siteOrigin:'https://eidos-works.com'},{mode:'live'},{backendUrl:'https://evil.example'},{backendUrl:'https://user:pass@fixture.vercel.app'},{backendUrl:'https://fixture.vercel.app?token=example'},{backendSha:'unknown'},{sourceRevision:'old'},{bundleHash:'unknown'},{database:'production'}])assert.throws(()=>validatePlaygroundPreviewPin({...pin,...change}));
});
test('manual preview refuses missing or enabled account, community, AI, checkout and local bypass flags',()=>{
  const config={accountsReady:false,communityReady:false,aiReady:false,playgroundAiReady:false,shopReady:false,localTest:false};assert.equal(verifyManualPreviewConfig(config),true);
  for(const key of Object.keys(config)){assert.throws(()=>verifyManualPreviewConfig({...config,[key]:true}));const missing={...config};delete missing[key];assert.throws(()=>verifyManualPreviewConfig(missing));}
});

const config={runtimeSourceRevision:pin.backendSha,runtimeBundleHash:pin.bundleHash,accountsReady:false,communityReady:false,aiReady:false,playgroundAiReady:false,shopReady:false,localTest:false};
const json=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}});
test('published relay waits for disabled stale identity and transient failures, then requires both exact pins',async()=>{
  const replies=[json({...config,runtimeSourceRevision:'c'.repeat(40)}),new Response('',{status:522}),json({...config,runtimeBundleHash:'d'.repeat(64)}),json({...config,unexpectedSecret:'never retain this'})];
  const requests=[];
  const result=await verifyPublishedRelay(pin.siteOrigin,pin,{attempts:4,delayMs:0,fetcher:async(url,options)=>{requests.push({url:String(url),options});return replies.shift();}});
  assert.equal(result.state,'verified');assert.deepEqual(result.config,config);
  assert.deepEqual(result.attempts.map(item=>item.outcome),['stale_identity','transient_http','stale_identity','verified']);
  assert.equal(result.attempts[0].observed.runtimeSourceRevision,'c'.repeat(40));
  assert.equal(result.attempts[2].observed.runtimeBundleHash,'d'.repeat(64));
  assert.ok(requests.every(item=>item.url===pin.siteOrigin+'/api/public-config'&&item.options.redirect==='error'&&item.options.cache==='no-store'&&item.options.signal));
  assert.ok(!JSON.stringify(result).includes('never retain this'));
});
test('published relay rejects every enabled or missing safety flag immediately even with an old source',async()=>{
  for(const flag of ['accountsReady','communityReady','aiReady','playgroundAiReady','shopReady','localTest'])for(const missing of [false,true]) {
    const unsafe={...config,runtimeSourceRevision:'c'.repeat(40),[flag]:true};if(missing)delete unsafe[flag];
    let calls=0;
    await assert.rejects(verifyPublishedRelay(pin.siteOrigin,pin,{attempts:3,delayMs:0,fetcher:async()=>{calls++;return json(unsafe);}}),error=>{
      assert.equal(error.readiness.reason,'unsafe_config');assert.equal(error.readiness.attempts.length,1);assert.equal(error.readiness.attempts[0].flags[flag],missing?null:true);return true;
    });assert.equal(calls,1);
  }
});
test('published relay retains bounded stale-source failure evidence without response secrets',async()=>{
  let calls=0;
  await assert.rejects(verifyPublishedRelay(pin.siteOrigin,pin,{attempts:2,delayMs:0,fetcher:async()=>{calls++;return json({...config,runtimeSourceRevision:'c'.repeat(40),secret:'do not log'});}}),error=>{
    assert.equal(error.readiness.reason,'retry_limit_exhausted');assert.equal(error.readiness.attempts.length,2);assert.deepEqual(error.readiness.expected,{runtimeSourceRevision:pin.backendSha,runtimeBundleHash:pin.bundleHash});assert.ok(!JSON.stringify(error.readiness).includes('do not log'));return true;
  });assert.equal(calls,2);
});
test('published relay retries transport and transient HTTP but rejects authorization, malformed JSON and missing identity',async()=>{
  const replies=[new DOMException('untrusted secret in transport message','TimeoutError'),new Response('',{status:404}),new Response('',{status:429}),json(config)];
  const result=await verifyPublishedRelay(pin.siteOrigin,pin,{attempts:4,delayMs:0,fetcher:async()=>{const reply=replies.shift();if(reply instanceof Error)throw reply;return reply;}});
  assert.equal(result.attempts.length,4);assert.equal(result.attempts[0].error,'TimeoutError');assert.ok(!JSON.stringify(result).includes('untrusted secret'));
  for(const [response,reason] of [[new Response('',{status:401}),'rejected_http'],[new Response('not json'),'invalid_response'],[json({...config,runtimeSourceRevision:null}),'invalid_identity'],[json({...config,runtimeSourceRevision:{toString:'invalid'}}),'invalid_identity']]) {
    let calls=0;await assert.rejects(verifyPublishedRelay(pin.siteOrigin,pin,{attempts:2,delayMs:0,fetcher:async()=>{calls++;return response;}}),error=>{assert.equal(error.readiness.reason,reason);assert.equal(error.readiness.attempts.length,1);return true;});assert.equal(calls,1);
  }
});
test('published relay cannot change the stable alias or remove its finite retry bound',async()=>{
  const fetcher=async()=>{throw Error('Invalid settings must not send a request');};
  await assert.rejects(verifyPublishedRelay('https://immutable.isolated.pages.dev',pin,{fetcher}),/stable preview alias/);
  for(const options of [{attempts:0},{attempts:31},{attempts:Infinity},{delayMs:-1},{delayMs:10001}])await assert.rejects(verifyPublishedRelay(pin.siteOrigin,pin,{...options,fetcher}),/bounded retry/);
});
test('only the exact audited previous manual pair can propagate without the new dedicated AI flag',async()=>{
 const previousManualBackend={backendSha:'c'.repeat(40),bundleHash:'d'.repeat(64)},next={...pin,previousManualBackend};
 const legacy={...config,runtimeSourceRevision:previousManualBackend.backendSha,runtimeBundleHash:previousManualBackend.bundleHash};delete legacy.playgroundAiReady;
 const replies=[json(legacy),json(config)];
 const result=await verifyPublishedRelay(pin.siteOrigin,next,{attempts:2,delayMs:0,fetcher:async()=>replies.shift()});
 assert.equal(result.state,'verified');assert.match(result.attempts[0].legacyPlaygroundFlag,/audited/);assert.equal(result.config.playgroundAiReady,false);
 for(const unsafe of [{...legacy,playgroundAiReady:true},{...legacy,runtimeBundleHash:'e'.repeat(64)}])await assert.rejects(verifyPublishedRelay(pin.siteOrigin,next,{attempts:2,delayMs:0,fetcher:async()=>json(unsafe)}),error=>error.readiness.reason==='unsafe_config');
 for(const previous of [{backendSha:pin.backendSha,bundleHash:pin.bundleHash},{backendSha:'unknown',bundleHash:'d'.repeat(64)}])assert.throws(()=>validatePlaygroundPreviewPin({...pin,previousManualBackend:previous}));
});
