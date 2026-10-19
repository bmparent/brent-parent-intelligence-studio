import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePredecessor,validateReplacement,predecessor} from './rehearsal-update-predecessor.mjs';
import {branch,origin} from './rehearsal-pages.mjs';
const next='f'.repeat(40);
function fixture(){return [{id:predecessor.id,url:predecessor.url,environment:'preview',created_on:'2026-10-19T02:32:00Z',aliases:[origin],deployment_trigger:{metadata:{branch,commit_hash:predecessor.commit}},latest_stage:{status:'success'}}];}
test('accept only the exact known successful predecessor',()=>assert.equal(validatePredecessor(fixture(),next).id,predecessor.id));
for(const [name,mutate] of [
  ['unknown predecessor',d=>d[0].id='unreviewed'],
  ['wrong source',d=>d[0].deployment_trigger.metadata.commit_hash='a'.repeat(40)],
  ['wrong URL',d=>d[0].url='https://unrelated.example'],
  ['wrong branch',d=>d[0].deployment_trigger.metadata.branch='main'],
  ['production',d=>d[0].environment='production'],
  ['absent alias',d=>d[0].aliases=[]],
  ['missing date',d=>delete d[0].created_on],
  ['pending deployment',d=>d[0].latest_stage.status='active'],
  ['failed predecessor',d=>d[0].latest_stage.status='failure'],
  ['a newer successful deployment',d=>d.push({...structuredClone(d[0]),id:'newer',created_on:'2026-10-19T03:00:00Z'})],
  ['duplicate successful attempt',d=>d.push({...structuredClone(d[0]),id:'attempt',deployment_trigger:{metadata:{branch,commit_hash:next}}})],
  ['duplicate failed attempt',d=>d.push({...structuredClone(d[0]),id:'attempt',deployment_trigger:{metadata:{branch,commit_hash:next}},latest_stage:{status:'failure'}})],
])test('reject '+name,()=>{const d=fixture();mutate(d);assert.throws(()=>validatePredecessor(d,next));});
test('reject replay of the original build',()=>assert.throws(()=>validatePredecessor(fixture(),predecessor.commit)));
test('reject malformed new identity',()=>assert.throws(()=>validatePredecessor(fixture(),'unverified')));
test('reject missing provider list',()=>assert.throws(()=>validatePredecessor(null,next)));
const notBefore='2026-10-19T04:00:00Z';
function replacement(){return[...fixture(),{id:'bbbbbbbb-0000-0000-0000-000000000000',url:'https://bbbbbbbb.eidosworks-playground-rehearsal-20261017.pages.dev',environment:'preview',created_on:'2026-10-19T04:01:00Z',aliases:[origin],deployment_trigger:{metadata:{branch,commit_hash:next}},latest_stage:{status:'success'}}];}
test('verify exact new latest successful attempt',()=>assert.equal(validateReplacement(replacement(),next,notBefore).deployment_trigger.metadata.commit_hash,next));
for(const [name,mutate] of [
 ['pending replacement',d=>d[1].latest_stage.status='active'],['failed replacement',d=>d[1].latest_stage.status='failure'],['preexisting upload',d=>d[1].created_on='2026-10-19T03:00:00Z'],['duplicate attempt',d=>d.push(structuredClone(d[1]))],['replacement after reviewed upload',d=>d.push({...structuredClone(d[1]),id:'other',created_on:'2026-10-19T04:02:00Z',deployment_trigger:{metadata:{branch,commit_hash:'a'.repeat(40)}}})],['foreign URL',d=>d[1].url='https://unrelated.example'],['production URL',d=>d[1].url='https://eidosworks.pages.dev'],['missing new alias',d=>d[1].aliases=[]],['new source relabel',d=>d[1].deployment_trigger.metadata.commit_hash=predecessor.commit],
 ['missing deployment ID',d=>delete d[1].id],['malformed deployment ID',d=>d[1].id='unverified'],
])test('reject post-upload: '+name,()=>{const d=replacement();mutate(d);assert.throws(()=>validateReplacement(d,next,notBefore));});
