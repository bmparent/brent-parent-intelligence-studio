import test from 'node:test';
import assert from 'node:assert/strict';
import { readGithub } from './github.ts';

test('GitHub source keeps only workflows for the observed PR head', async () => {
  const head='a'.repeat(40);
  const fetcher=async (input: RequestInfo | URL) => {
    const url=String(input);
    if(url.includes('/pulls/')) return new Response(JSON.stringify({title:'Draft',state:'open',draft:true,merged:false,head:{sha:head,ref:'owner-branch'},updated_at:'2026-09-24T00:00:00Z'}));
    return new Response(JSON.stringify({workflow_runs:[{id:1,name:'Current',head_sha:head,status:'completed',conclusion:'success'},{id:2,name:'Old',head_sha:'b'.repeat(40),status:'completed',conclusion:'success'}]}));
  };
  const observed=await readGithub(fetcher as typeof fetch,new Date('2026-09-24T12:00:00Z'));
  assert.equal(observed.status,'healthy');
  assert.equal(observed.data.pulls.length,4);
  assert.equal(observed.data.workflows[0].runs.length,1);
  assert.equal(observed.data.workflows[0].runs[0].name,'Current');
});

test('GitHub source reports a partial read rather than inventing a green gate', async () => {
  const observed=await readGithub(async (input: RequestInfo | URL) => {
    if(String(input).includes('/pulls/68')) return new Response(JSON.stringify({state:'open',draft:true,head:{sha:'a'.repeat(40),ref:'owner'}}));
    return new Response('{}',{status:503});
  });
  assert.equal(observed.status,'partial');
  assert.equal(observed.errorCode,'github_read_partial');
  assert.equal(observed.data.pulls.length,1);
});
