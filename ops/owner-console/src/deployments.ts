type Config = {
  EIDOS_PLATFORM_URL?: string;
  EIDOS_PLATFORM_PREVIEW_BYPASS?: string;
  EIDOS_SITE_PREVIEW_URL?: string;
  EIDOS_OWNER_WORKER_REVISION?: string;
};

function exactUrl(value: string | undefined, suffix: string) {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && url.hostname.endsWith(suffix) && !url.username && !url.password && !url.search && !url.hash ? url : null;
  } catch { return null; }
}

/** Bounded availability probes. Deployment metadata requires separate provider grants. */
export async function readDeployments(config: Config, fetcher: typeof fetch = fetch, now = new Date()) {
  const backend=exactUrl(config.EIDOS_PLATFORM_URL,'.vercel.app');
  const site=exactUrl(config.EIDOS_SITE_PREVIEW_URL,'.pages.dev');
  const probe=async (url: URL | null, path: string, headers: HeadersInit = {}) => {
    if (!url) return { status: 'not_configured', httpStatus: null, observedAt: null };
    try {
      const target=new URL(path,url);
      const response=await fetcher(target,{method:'GET',headers,redirect:'manual',signal:AbortSignal.timeout(7000)});
      return { status: response.status === 200 ? 'healthy' : 'unavailable', httpStatus: response.status, observedAt: now.toISOString() };
    } catch { return { status: 'unavailable', httpStatus: null, observedAt: now.toISOString() }; }
  };
  const [backendHealth,siteHealth]=await Promise.all([
    probe(backend,'/api/works/v1/health',config.EIDOS_PLATFORM_PREVIEW_BYPASS ? {'x-vercel-protection-bypass':config.EIDOS_PLATFORM_PREVIEW_BYPASS} : {}),
    probe(site,'/'),
  ]);
  const statuses=[backendHealth.status,siteHealth.status];
  return { status: statuses.every(x=>x==='healthy') ? 'healthy' : statuses.includes('unavailable') ? 'partial' : 'not_configured',
    observedAt: now.toISOString(), staleAfter: new Date(now.getTime()+120000).toISOString(),
    source: 'HTTP availability probes', environment: 'preview', errorCode: statuses.includes('unavailable') ? 'deployment_probe_failed' : null,
    data: {
      worker: { status: 'healthy', revision: /^[a-f0-9]{40}$/.test(config.EIDOS_OWNER_WORKER_REVISION||'') ? config.EIDOS_OWNER_WORKER_REVISION : null },
      backend: { ...backendHealth, url: backend?.origin || null, revision: null, deploymentId: null },
      site: { ...siteHealth, url: site?.origin || null, revision: null, deploymentId: null },
      providerLogs: 'not_configured',
    },
  };
}
