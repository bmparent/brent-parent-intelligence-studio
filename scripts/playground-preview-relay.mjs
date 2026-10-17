import {validatePlaygroundPreviewPin,verifyManualPreviewConfig} from './playground-preview-pin.mjs';

const flags=['accountsReady','communityReady','aiReady','playgroundAiReady','shopReady','localTest'];
const sourcePattern=/^[a-f0-9]{40}$/,bundlePattern=/^[a-f0-9]{64}$/;
const transientStatus=status=>status===404||status===408||status===429||(status>=500&&status<=599);
/** The stable Pages alias can briefly route to the previous deployment after upload. */
export async function verifyPublishedRelay(origin,pin,{attempts=12,delayMs=2000,fetcher=fetch}={}) {
  validatePlaygroundPreviewPin(pin);
  if(origin!==pin.siteOrigin)throw Error('Relay readiness must use the pinned stable preview alias.');
  if(!Number.isInteger(attempts)||attempts<1||attempts>30||!Number.isInteger(delayMs)||delayMs<0||delayMs>10000)throw Error('Relay readiness requires bounded retry settings.');
  const history=[],expected={runtimeSourceRevision:pin.backendSha,runtimeBundleHash:pin.bundleHash};
  function fail(reason) {
    const error=new Error('Published Pages relay readiness failed: '+reason+'.');
    error.readiness={state:'failed',reason,origin,expected,attempts:history};
    throw error;
  }
  for(let attempt=1;attempt<=attempts;attempt++) {
    let response,data,transport;
    try {
      response=await fetcher(new URL('/api/public-config',origin),{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(response.ok)data=await response.json();
    } catch(error) {
      // Record only a fixed error class; transport messages or response bodies may contain secrets.
      if(!['TimeoutError','TypeError','AbortError'].includes(error.name)) {
        history.push({attempt,status:response?.status??null,outcome:'invalid_response'});
        fail('invalid_response');
      }
      transport=error.name;
    }
    if(transport)history.push({attempt,status:response?.status??null,outcome:'transient_transport',error:transport});
    else if(!response.ok) {
      const retry=transientStatus(response.status);
      history.push({attempt,status:response.status,outcome:retry?'transient_http':'rejected_http'});
      if(!retry)fail('rejected_http');
    } else {
      const observed={runtimeSourceRevision:typeof data?.runtimeSourceRevision==='string'&&sourcePattern.test(data.runtimeSourceRevision)?data.runtimeSourceRevision:null,runtimeBundleHash:typeof data?.runtimeBundleHash==='string'&&bundlePattern.test(data.runtimeBundleHash)?data.runtimeBundleHash:null};
      const observedFlags=Object.fromEntries(flags.map(flag=>[flag,typeof data?.[flag]==='boolean'?data[flag]:null]));
      const entry={attempt,status:response.status,observed,flags:observedFlags,outcome:'pending'};
      history.push(entry);
      // The explicitly audited previous manual runtime predates this one flag.
      // Permit only that exact old pair to propagate; enabled flags, unknown
      // legacy sources and the new pinned source still fail closed immediately.
      const previous=pin.previousManualBackend;
      const knownLegacy=previous&&observed.runtimeSourceRevision===previous.backendSha&&observed.runtimeBundleHash===previous.bundleHash&&data.playgroundAiReady===undefined;
      if(knownLegacy)entry.legacyPlaygroundFlag='missing on audited previous manual runtime';
      try {verifyManualPreviewConfig(knownLegacy?{...data,playgroundAiReady:false}:data);} catch {entry.outcome='unsafe_config';fail('unsafe_config');}
      if(!observed.runtimeSourceRevision||!observed.runtimeBundleHash){entry.outcome='invalid_identity';fail('invalid_identity');}
      if(observed.runtimeSourceRevision===expected.runtimeSourceRevision&&observed.runtimeBundleHash===expected.runtimeBundleHash) {
        entry.outcome='verified';
        return {state:'verified',origin,expected,attempts:history,config:{...observed,...observedFlags}};
      }
      entry.outcome='stale_identity';
    }
    if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
  }
  fail('retry_limit_exhausted');
}
