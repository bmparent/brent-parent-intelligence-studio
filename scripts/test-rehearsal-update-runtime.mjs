import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRuntimeConfig} from './rehearsal-update-pages.mjs';
import {backendSha,bundleHash} from './rehearsal-pages.mjs';
function fixture(){return{accountsReady:false,communityReady:false,aiReady:false,playgroundAiReady:false,shopReady:false,localTest:false,gaMeasurementId:'',runtimeSourceRevision:backendSha,runtimeBundleHash:bundleHash};}
test('require exact disabled actual relay config before and after upload',()=>{const c=fixture();assert.equal(validateRuntimeConfig(c),c);});
for(const key of ['accountsReady','communityReady','aiReady','playgroundAiReady','shopReady','localTest']){
 test('reject actual enabled '+key,()=>{const c=fixture();c[key]=true;assert.throws(()=>validateRuntimeConfig(c));});
 test('reject actual missing '+key,()=>{const c=fixture();delete c[key];assert.throws(()=>validateRuntimeConfig(c));});
}
for(const [key,value] of [['runtimeSourceRevision','0'.repeat(40)],['runtimeBundleHash','0'.repeat(64)],['gaMeasurementId','G-UNREVIEWED']])test('reject actual '+key+' drift',()=>{const c=fixture();c[key]=value;assert.throws(()=>validateRuntimeConfig(c));});
