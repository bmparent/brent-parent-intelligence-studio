import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePlaygroundPreviewPin,verifyManualPreviewConfig,playgroundPreviewProject,playgroundPreviewBranch,playgroundPreviewOrigin} from './playground-preview-pin.mjs';
const pin={project:playgroundPreviewProject,branch:playgroundPreviewBranch,siteOrigin:playgroundPreviewOrigin,mode:'manual-only',backendUrl:'https://fixture.vercel.app',backendSha:'a'.repeat(40),bundleHash:'b'.repeat(64),sourceRevision:'a'.repeat(40)+'-bundle-'+'b'.repeat(16),backendDeployment:'dpl_fixture',database:'none'};
test('isolated manual preview refuses production, unpinned bundles, credential URLs and persistent bindings',()=>{
  assert.equal(validatePlaygroundPreviewPin(pin),pin);
  for(const change of [{project:'eidosworks'},{branch:'main'},{siteOrigin:'https://eidos-works.com'},{mode:'live'},{backendUrl:'https://evil.example'},{backendUrl:'https://user:pass@fixture.vercel.app'},{backendUrl:'https://fixture.vercel.app?token=example'},{backendSha:'unknown'},{sourceRevision:'old'},{bundleHash:'unknown'},{database:'production'}])assert.throws(()=>validatePlaygroundPreviewPin({...pin,...change}));
});
test('manual preview refuses missing or enabled account, community, AI, checkout and local bypass flags',()=>{
  const config={accountsReady:false,communityReady:false,aiReady:false,shopReady:false,localTest:false};assert.equal(verifyManualPreviewConfig(config),true);
  for(const key of Object.keys(config)){assert.throws(()=>verifyManualPreviewConfig({...config,[key]:true}));const missing={...config};delete missing[key];assert.throws(()=>verifyManualPreviewConfig(missing));}
});
