import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
/** Pages can acknowledge a new upload before its static assets answer consistently. */
export async function verifyPublishedAssets(origin,dist,{attempts=12,delayMs=2000,fetcher=fetch}={}) {
  const history=[];
  for(let attempt=1;attempt<=attempts;attempt++) {
    const failures=[],verified=[];
    try {
      const page=await fetcher(new URL('/playground/',origin),{signal:AbortSignal.timeout(10000)});
      if(!page.ok)failures.push({path:'/playground/',status:page.status});
      else {
        const html=await page.text();
        const assets=[...new Set(html.match(/\/assets\/[A-Za-z0-9_.-]+\.(?:js|css)/g)||[])];
        if(!assets.some(asset=>asset.endsWith('.js')))throw Error('Published editor has no application bundle.');
        for(const asset of assets) {
          let expected;
          try { expected=await readFile(path.join(dist,asset.slice(1))); }
          catch(error) { if(error.code!=='ENOENT')throw error; failures.push({path:asset,error:'candidate_bundle_not_published'});continue; }
          const response=await fetcher(new URL(asset,origin),{signal:AbortSignal.timeout(10000)});
          if(!response.ok){failures.push({path:asset,status:response.status});continue;}
          const actual=Buffer.from(await response.arrayBuffer());
          if(digest(actual)!==digest(expected))throw Error('Published asset differs from the built candidate: '+asset);
          verified.push({path:asset,bytes:actual.length,sha256:digest(actual)});
        }
      }
    } catch(error) {
      // Retry only transient transport failures, never a source identity mismatch.
      if(!['TimeoutError','TypeError'].includes(error.name))throw error;
      failures.push({path:'transport',error:error.name});
    }
    history.push({attempt,failures});
    if(!failures.length)return {attempts:history,assets:verified};
    if(failures.some(item=>item.status&&item.status<500&&item.status!==404))throw Error('Published preview assets were rejected: '+JSON.stringify(history));
    if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
  }
  throw Error('Published preview assets did not become available: '+JSON.stringify(history));
}
