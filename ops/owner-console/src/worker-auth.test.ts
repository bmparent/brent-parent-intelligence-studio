import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import worker from './worker.ts';

test('owner Worker denies missing, forged, expired and different-subject JWTs before HTML or API', async () => {
  const { publicKey, privateKey }=await generateKeyPair('RS256');
  const jwk=await exportJWK(publicKey);jwk.kid='owner-test';jwk.alg='RS256';jwk.use='sig';
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async input=>{
    const url=String(input);
    if(url.includes('/cdn-cgi/access/certs'))return new Response(JSON.stringify({keys:[jwk]}));
    if(url.startsWith('https://api.github.com/'))return new Response(JSON.stringify(url.includes('/actions/runs')?{workflow_runs:[]}:{title:'Draft',state:'open',draft:true,head:{sha:'a'.repeat(40),ref:'owner-test'}}));
    throw Error('Unexpected outbound request');
  };
  const env={EIDOS_OPS_HOST:'owner-preview.example.com',EIDOS_OPS_ACCESS_TEAM:'owner-worker-test',EIDOS_OPS_ACCESS_AUD:'owner-audience',EIDOS_OPS_OWNER_SUB:'owner-123',EIDOS_OPS_OWNER_EMAIL:'owner@example.invalid'};
  const make=(path:string,token?:string)=>new Request('https://owner-preview.example.com'+path,{headers:token?{'cf-access-jwt-assertion':token}:{}});
  const sign=(sub:string,exp='5m')=>new SignJWT({email:'owner@example.invalid'}).setProtectedHeader({alg:'RS256',kid:'owner-test'}).setIssuer('https://owner-worker-test.cloudflareaccess.com').setAudience('owner-audience').setSubject(sub).setIssuedAt().setExpirationTime(exp).sign(privateKey);
  try {
    assert.equal((await worker.fetch(make('/'),env)).status,403);
    assert.equal((await worker.fetch(make('/api/sources/github','forged'),env)).status,403);
    assert.equal((await worker.fetch(make('/',await sign('owner-123','-1s')),env)).status,403);
    assert.equal((await worker.fetch(make('/api/sources/github',await sign('other-123')),env)).status,403);
    assert.equal((await worker.fetch(new Request('https://owner.example.workers.dev/',{headers:{'cf-access-jwt-assertion':await sign('owner-123')}}),env)).status,403);
    assert.equal((await worker.fetch(make('/',await sign('owner-123')),env)).status,200);
    const api=await worker.fetch(make('/api/sources/github',await sign('owner-123')),env);
    assert.equal(api.status,200);
    assert.equal((await api.json()).data.pulls.length,4);
  } finally {globalThis.fetch=originalFetch;}
});
