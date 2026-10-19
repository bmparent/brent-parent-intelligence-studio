export function validateTemplatePreviewPin(pin) {
  const siteOrigin = 'https://eidosworks-templates-test-20261010.pages.dev';
  const backend = new URL(pin.backendOrigin);
  if (pin.siteOrigin !== siteOrigin || pin.mode !== 'test' || !/^dpl_[a-zA-Z0-9]+$/.test(pin.deploymentId || '') || !/^[a-f0-9]{40}$/.test(pin.backendSha || '') || !/^[a-f0-9]{64}$/.test(pin.bundleHash || '') || backend.protocol !== 'https:' || !backend.hostname.endsWith('.vercel.app') || backend.username || backend.password || backend.pathname !== '/' || backend.search || backend.hash) throw Error('Invalid isolated template backend pin.');
  if (pin.sourceRevision !== pin.backendSha + '-bundle-' + pin.bundleHash.slice(0, 16)) throw Error('Template source revision does not match the frozen backend bundle.');
  return { ...pin, backendOrigin: backend.origin };
}

export function verifyTemplateCatalogPin(pin, data, expectedProducts) {
  if (data.mode !== 'test' || data.ready !== true || data.sourceRevision !== pin.sourceRevision) throw Error('Hosted template environment does not match the pinned TEST source.');
  for (const product of expectedProducts) {
    const actual = data.editions?.find(item => item.id === product.id);
    if (!actual || actual.version !== product.version || actual.priceCents !== product.priceCents || (product.editionId === 'developer' ? actual.available !== true : actual.available !== false)) throw Error('Hosted template edition differs from the reviewed catalog: ' + product.id);
  }
}
