import { useEffect, useState } from 'react';
export interface PublicConfig {
  gaMeasurementId: string;
  turnstileSiteKey: string;
  communityReady: boolean;
  accountsReady: boolean;
  aiReady: boolean;
  shopReady: boolean;
  localTest: boolean;
}
const fallback: PublicConfig = {
  gaMeasurementId: '',
  turnstileSiteKey: '',
  communityReady: false,
  accountsReady: false,
  aiReady: false,
  shopReady: false,
  localTest: false,
};
let configPromise: Promise<PublicConfig> | undefined;
export function getConfig() {
  return (configPromise ??= fetch('/api/public-config')
    .then(async (response) =>
      response.ok ? { ...fallback, ...(await response.json()) } : fallback,
    )
    .catch(() => fallback));
}
export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  useEffect(() => {
    let active = true;
    getConfig().then((value) => {
      if (active) setConfig(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return config;
}
export async function post<T = Record<string, unknown>>(
  url: string,
  data: unknown,
  token?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(25000),
  });
  let value: Record<string, unknown>;
  try {
    value = await response.json();
  } catch {
    throw Error('This service could not connect. Please try again shortly.');
  }
  if (!response.ok)
    throw Error(
      typeof value.error === 'string'
        ? value.error
        : 'This request could not be completed.',
    );
  return value as T;
}

export function requestId() {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}
