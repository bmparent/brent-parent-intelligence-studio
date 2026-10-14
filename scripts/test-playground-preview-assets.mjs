import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verifyPublishedAssets} from './playground-preview-assets.mjs';

test('asset gate retains a transient 522, then verifies the actual built bytes',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'playground-assets-'));
  try {
    await mkdir(path.join(dir,'assets'));await writeFile(path.join(dir,'assets/app.js'),'candidate');
    let requests=0;
    const fetcher=async url=>url.pathname==='/playground/'?new Response('<script src="/assets/app.js"></script>'):++requests===1?new Response('',{status:522}):new Response('candidate');
    const result=await verifyPublishedAssets('https://isolated.pages.dev',dir,{fetcher,delayMs:0,attempts:2});
    assert.equal(result.attempts[0].failures[0].status,522);assert.equal(result.attempts.length,2);assert.equal(result.assets[0].bytes,9);
    await assert.rejects(verifyPublishedAssets('https://isolated.pages.dev',dir,{fetcher:async url=>url.pathname==='/playground/'?new Response('<script src="/assets/app.js"></script>'):new Response('different'),attempts:1}),/differs from the built candidate/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
