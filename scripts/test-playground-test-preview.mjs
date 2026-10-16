import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTestPin, verifyTestConfig, testProject, testBranch, testOrigin } from './deploy-playground-test-preview.mjs';
const pin={project:testProject,branch:testBranch,siteOrigin:testOrigin,mode:'test',database:'approved-test-validation',backendUrl:'https://eidos-sentinel-abc-1brentbm-1876s-projects.vercel.app',backendSha:'a'.repeat(40),bundleHash:'b'.repeat(64),backendDeployment:'dpl_fixture',sourceRevision:'a'.repeat(40)+'-bundle-'+'b'.repeat(16)};
const config={accountsReady:true,shopReady:true,communityReady:false,aiReady:false,playgroundAiReady:false,localTest:false,turnstileSiteKey:'1x00000000000000000000AA',runtimeSourceRevision:pin.backendSha,runtimeBundleHash:pin.bundleHash};
test('TEST pin requires the exact isolated deployment, source and approved validation database',()=>{
  assert.equal(validateTestPin(pin),pin);
  for(const change of [{siteOrigin:'https://eidos-works.com'},{mode:'live'},{database:'production'},{backendUrl:'https://eidos-sentinel-lab.vercel.app'},{sourceRevision:'stale'},{backendDeployment:''}])assert.throws(()=>validateTestPin({...pin,...change}));
});
test('TEST readiness requires actual accounts/shop configuration and no unrelated activation',()=>{
  verifyTestConfig(config,pin);
  for(const flag of ['accountsReady','shopReady','communityReady','aiReady','playgroundAiReady','localTest'])assert.throws(()=>verifyTestConfig({...config,[flag]:!config[flag]},pin));
  assert.throws(()=>verifyTestConfig({...config,runtimeBundleHash:'c'.repeat(64)},pin));
});
