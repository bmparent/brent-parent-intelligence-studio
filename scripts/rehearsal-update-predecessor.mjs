import assert from 'node:assert/strict';
import {branch,origin} from './rehearsal-pages.mjs';

export const predecessor = Object.freeze({
  id:'a8158d15-afbb-4da3-ae48-3d7dacfd22e7',
  url:'https://a8158d15.eidosworks-playground-rehearsal-20261017.pages.dev',
  commit:'8e3ed6c0470fa696452380a9981b794eacc02c5b',
});

/** Only a new verified build may replace the already accepted rehearsal. */
export function validatePredecessor(deployments,newBuild) {
  assert.ok(Array.isArray(deployments),'Provider deployment list missing');
  assert.match(newBuild,/^[a-f0-9]{40}$/,'New build identity missing');
  assert.notEqual(newBuild,predecessor.commit,'Original artifact must not be uploaded again');
  const scoped=deployments.filter(d=>d.environment==='preview'&&d.deployment_trigger?.metadata?.branch===branch);
  assert.ok(scoped.length,'Known predecessor missing');
  for(const d of scoped){
    assert.ok(['success','failure','canceled'].includes(d.latest_stage?.status),'Concurrent or unknown deployment state');
    assert.ok(Number.isFinite(Date.parse(d.created_on)),'Deployment timestamp missing');
    assert.notEqual(d.deployment_trigger?.metadata?.commit_hash,newBuild,'New build already attempted; reconcile before another upload');
  }
  const latest=scoped.filter(d=>d.latest_stage.status==='success').sort((a,b)=>Date.parse(b.created_on)-Date.parse(a.created_on))[0];
  assert.ok(latest,'No successful predecessor');
  assert.equal(latest.id,predecessor.id,'Unexpected successful predecessor');
  assert.equal(latest.url,predecessor.url,'Predecessor URL differs');
  assert.equal(latest.deployment_trigger.metadata.commit_hash,predecessor.commit,'Predecessor source differs');
  assert.ok(latest.aliases?.some(url=>url===origin||'https://'+url===origin),'Predecessor branch alias missing');
  return {...predecessor,branch};
}

export function validateReplacement(deployments,newBuild,notBefore){
  assert.ok(Array.isArray(deployments));assert.match(newBuild,/^[a-f0-9]{40}$/);assert.notEqual(newBuild,predecessor.commit);
  assert.ok(Number.isFinite(Date.parse(notBefore)));
  const scoped=deployments.filter(d=>d.environment==='preview'&&d.deployment_trigger?.metadata?.branch===branch);
  for(const d of scoped){assert.ok(['success','failure','canceled'].includes(d.latest_stage?.status));assert.ok(Number.isFinite(Date.parse(d.created_on)));}
  const matches=scoped.filter(d=>d.deployment_trigger?.metadata?.commit_hash===newBuild);
  assert.equal(matches.length,1,'New build must have exactly one reconciled deployment attempt');
  const d=matches[0];assert.equal(d.latest_stage.status,'success');assert.match(d.id,/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/);assert.notEqual(d.id,predecessor.id);
  assert.ok(Date.parse(d.created_on)>=Date.parse(notBefore),'Deployment predates this preflight');
  const latest=scoped.filter(d=>d.latest_stage.status==='success').sort((a,b)=>Date.parse(b.created_on)-Date.parse(a.created_on))[0];
  assert.equal(latest?.id,d.id,'Another deployment replaced the reviewed upload');
  const url=new URL(d.url);assert.equal(url.protocol,'https:');assert.equal(url.username,'');assert.equal(url.password,'');assert.equal(url.pathname,'/');assert.equal(url.search,'');assert.equal(url.hash,'');
  assert.match(url.hostname,/^[a-f0-9]+\.eidosworks-playground-rehearsal-20261017\.pages\.dev$/);
  assert.ok(d.aliases?.some(value=>value===origin||'https://'+value===origin),'Provider-issued branch alias absent');
  return d;
}
