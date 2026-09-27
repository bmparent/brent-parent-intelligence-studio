import { readGithub } from './github';
import { readDeployments } from './deployments';

export interface RefreshStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface DailyRefreshEnv {
  EIDOS_OWNER_REFRESH?: RefreshStore;
  EIDOS_PLATFORM_URL?: string;
  EIDOS_PLATFORM_PREVIEW_BYPASS?: string;
  EIDOS_SITE_PREVIEW_URL?: string;
  EIDOS_OWNER_WORKER_REVISION?: string;
}

export interface DailyRefreshRecord {
  attemptedAt: string;
  lastSuccessAt: string | null;
  status: 'healthy' | 'partial' | 'unavailable';
  sources: {
    github: { status: string; observedAt: string | null; errorCode: string | null };
    deployments: { status: string; observedAt: string | null; errorCode: string | null };
  };
}

const key = 'owner-preview-daily-public-sources-v1';

export async function readDailyRefresh(store?: RefreshStore): Promise<DailyRefreshRecord | null> {
  if (!store) return null;
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as DailyRefreshRecord; } catch { return null; }
}

/** Public metadata and HTTP probes only. The scheduled event never receives an owner JWT. */
export async function runDailyRefresh(env: DailyRefreshEnv, now = new Date(), fetcher: typeof fetch = fetch): Promise<DailyRefreshRecord> {
  if (!env.EIDOS_OWNER_REFRESH) throw new Error('daily_refresh_store_not_configured');
  const previous = await readDailyRefresh(env.EIDOS_OWNER_REFRESH);
  const [github, deployments] = await Promise.allSettled([
    readGithub(fetcher, now),
    readDeployments(env, fetcher, now),
  ]);
  const sources = {
    github: github.status === 'fulfilled'
      ? { status: github.value.status, observedAt: github.value.observedAt, errorCode: github.value.errorCode }
      : { status: 'unavailable', observedAt: null, errorCode: 'github_read_failed' },
    deployments: deployments.status === 'fulfilled'
      ? { status: deployments.value.status, observedAt: deployments.value.observedAt, errorCode: deployments.value.errorCode }
      : { status: 'unavailable', observedAt: null, errorCode: 'deployment_probe_failed' },
  };
  const statuses = Object.values(sources).map(source => source.status);
  const status = statuses.every(value => value === 'healthy') ? 'healthy'
    : statuses.every(value => value === 'unavailable') ? 'unavailable' : 'partial';
  const record: DailyRefreshRecord = {
    attemptedAt: now.toISOString(),
    lastSuccessAt: status === 'healthy' ? now.toISOString() : previous?.lastSuccessAt || null,
    status,
    sources,
  };
  await env.EIDOS_OWNER_REFRESH.put(key, JSON.stringify(record));
  return record;
}
