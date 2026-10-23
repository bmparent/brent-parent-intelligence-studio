import { drainSnapshotJobs } from '../../functions/_shared/snapshot/generation'
import type { SnapshotEnv } from '../../functions/_shared/snapshot/types'
type WorkerEnv = SnapshotWorkerEnv & Pick<SnapshotEnv, 'OPENAI_API_KEY'>
export default {
  async scheduled(_event:ScheduledController,env:WorkerEnv) { await drainSnapshotJobs(env) },
  fetch() { return new Response('Not found',{status:404}) },
} satisfies ExportedHandler<WorkerEnv>
