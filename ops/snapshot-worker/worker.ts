import { drainSnapshotJobs } from '../../functions/_shared/snapshot/generation'
import type { SnapshotEnv } from '../../functions/_shared/snapshot/types'
export default {
  async scheduled(_event:unknown,env:SnapshotEnv) { await drainSnapshotJobs(env) },
  fetch() { return new Response('Not found',{status:404}) },
}
