export const playgroundPreviewProject = 'eidosworks-playground-20261014';
export const playgroundPreviewBranch = 'codex/playground-unified-20261014';
export const playgroundPreviewOrigin = `https://${playgroundPreviewProject}.pages.dev`;

export function validatePlaygroundPreviewPin(pin) {
  if (pin?.project !== playgroundPreviewProject || pin.branch !== playgroundPreviewBranch || pin.siteOrigin !== playgroundPreviewOrigin || pin.mode !== 'manual-only') throw Error('Expected the isolated manual Playground preview.');
  const backend = new URL(pin.backendUrl);
  if (backend.protocol !== 'https:' || !backend.hostname.endsWith('.vercel.app') || backend.username || backend.password || backend.port || backend.pathname !== '/' || backend.search || backend.hash) throw Error('Expected an isolated backend origin without credentials.');
  if (!/^[a-f0-9]{40}$/.test(pin.backendSha) || !/^[a-f0-9]{64}$/.test(pin.bundleHash) || !/^dpl_[A-Za-z0-9]+$/.test(pin.backendDeployment)) throw Error('An exact backend deployment and source bundle are required.');
  if (pin.sourceRevision !== `${pin.backendSha}-bundle-${pin.bundleHash.slice(0,16)}` || pin.database !== 'none') throw Error('Manual preview source or database boundary does not match.');
  if(pin.previousManualBackend&&(!/^[a-f0-9]{40}$/.test(pin.previousManualBackend.backendSha)||!/^[a-f0-9]{64}$/.test(pin.previousManualBackend.bundleHash)||pin.previousManualBackend.backendSha===pin.backendSha))throw Error('Previous manual source must have a distinct exact identity.');
  return pin;
}

export function verifyManualPreviewConfig(data) {
  for (const flag of ['accountsReady', 'communityReady', 'aiReady', 'playgroundAiReady', 'shopReady', 'localTest']) if (data?.[flag] !== false) throw Error(`Manual preview requires ${flag}=false.`);
  return true;
}
