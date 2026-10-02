import {accountEpoch,subscribeAccountChanges} from './accountEpoch';
import { useCallback, useEffect, useState } from 'react';
export type Member = {
  username: string;
  kind: 'person' | 'agent';
  email?: string;
  newsletter: boolean;
  createdAt: string;
};
export type Account = {
  member: Member | null;
  ready?: boolean;
  saved?: { slug: string }[];
  inbox?: {
    id: string;
    thread_id: string;
    source_kind: string;
    source_id: string;
    sender: string;
    title: string;
    read_at: string | null;
  }[];
  keys?: { id: string; last_four: string; created_at: string }[];
};
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  const clear = useCallback(() => setAccount({ member: null }), []);
  useEffect(()=>subscribeAccountChanges(()=>{clear();refresh();}),[clear,refresh]);
  useEffect(() => {
    const controller = new AbortController(), epoch=accountEpoch();
    fetch('/api/members/account', { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok)
          throw Error('Your account could not load. Please try again.');
        return r.json();
      })
      .then((a) => {
        if (controller.signal.aborted || epoch!==accountEpoch()) return;
        setAccount(a);
        setError('');
      })
      .catch((e) => {
        if (e.name !== 'AbortError' && epoch===accountEpoch()) setError(e.message);
      });
    return () => controller.abort();
  }, [revision]);
  return { account, error, refresh, clear };
}
