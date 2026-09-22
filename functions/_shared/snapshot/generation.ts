import { capturePublicPage } from './capture'
import { generateConceptImage, generateStructuredReport } from './openai'
import { getSnapshotStore, type SnapshotStore } from './storage'
import type { SnapshotEnv, SnapshotRecord } from './types'

const remedy = 'The written report is available, but the concept image could not be delivered. Contact snapshot@eidos-works.com with your checkout email for a delivery review or refund request.'
export function snapshotReady(env: SnapshotEnv) {
  const daily = Number(env.SNAPSHOT_DAILY_ALLOWANCE_CENTS || 0), cost = Number(env.SNAPSHOT_MAX_JOB_COST_CENTS || 0)
  return Boolean(env.SNAPSHOT_DB && env.SNAPSHOT_OBJECTS && env.SNAPSHOT_GENERATION_ENABLED === 'true' && env.SNAPSHOT_CAPTURE_APPROVED === 'true' && env.OPENAI_TEXT_MODEL && env.OPENAI_IMAGE_MODEL && (env.OPENAI_SNAPSHOT_API_KEY || env.OPENAI_API_KEY) && Number.isSafeInteger(daily) && Number.isSafeInteger(cost) && cost > 0 && daily >= cost)
}
export async function checksum(bytes: Uint8Array) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes)))].map(n=>n.toString(16).padStart(2,'0')).join('')
}
// Claim is a single compare-and-set. A claimed provider stage is never replayed
// automatically: a timeout/crash may have incurred cost even without a response.
export async function generateSnapshot(requestId: string, store: SnapshotStore, env: SnapshotEnv) {
  if (!snapshotReady(env) || !store.database) return
  const db = store.database, claim = crypto.randomUUID(), now = Date.now()
  const claimed = await db.prepare("UPDATE snapshot_jobs SET state='running',claimed=?,updated=? WHERE order_id=? AND state='queued' AND EXISTS(SELECT 1 FROM snapshot_orders WHERE id=? AND status='paid' AND expires>?)").bind(claim,now,requestId,requestId,now).run()
  if (!claimed.meta.changes) return
  let record = await store.getByRequestId(requestId)
  if (!record || record.status !== 'paid') return
  const day = new Date().toISOString().slice(0,10), cost = Number(env.SNAPSHOT_MAX_JOB_COST_CENTS), cap = Number(env.SNAPSHOT_DAILY_ALLOWANCE_CENTS)
  await db.prepare('INSERT OR IGNORE INTO snapshot_budget(day,reserved) VALUES(?,0)').bind(day).run()
  const reserved = await db.prepare('UPDATE snapshot_budget SET reserved=reserved+? WHERE day=? AND reserved+?<=?').bind(cost,day,cost,cap).run()
  if (!reserved.meta.changes) {
    await db.prepare("UPDATE snapshot_jobs SET state='queued',claimed=NULL,reason='daily_allowance',updated=? WHERE order_id=? AND claimed=?").bind(Date.now(),requestId,claim).run()
    return
  }
  const active = async () => {
    const current = await store.getByRequestId(requestId)
    if(!current || !['paid','processing'].includes(current.status)) throw Error('order-inactive')
  }
  const startStage = async (stage:string, model:string) => {
    await active()
    const result = await db.prepare("INSERT OR IGNORE INTO snapshot_stages(order_id,stage,state,model,started) VALUES(?,?,'started',?,?)").bind(requestId,stage,model,Date.now()).run()
    if(!result.meta.changes) throw Error('stage-already-attempted')
  }
  const finishStage = async (stage:string) => { await db.prepare("UPDATE snapshot_stages SET state='received',finished=? WHERE order_id=? AND stage=?").bind(Date.now(),requestId,stage).run() }
  try {
    record = {...record,status:'processing',processingStartedAt:new Date().toISOString()}
    await store.save(record)
    const capture = await capturePublicPage(record.intake.websiteUrl)
    await startStage('report',env.OPENAI_TEXT_MODEL!)
    const report = await generateStructuredReport(env,record.intake,capture.page)
    await finishStage('report')
    record = {...record,report,captureNote:capture.note}
    await store.save(record)
    await startStage('image',env.OPENAI_IMAGE_MODEL!)
    const image = await generateConceptImage(env,report,record.intake)
    let imageKey:string|undefined, imageSha256:string|undefined
    if(image.base64Image) {
      const bytes = Uint8Array.from(atob(image.base64Image),c=>c.charCodeAt(0))
      imageSha256 = await checksum(bytes)
      imageKey = `snapshot/${requestId}/${imageSha256}.jpg`
      await env.SNAPSHOT_OBJECTS!.put(imageKey,bytes,{httpMetadata:{contentType:'image/jpeg'}})
      const stored = await env.SNAPSHOT_OBJECTS!.get(imageKey)
      if(!stored || await checksum(new Uint8Array(await stored.arrayBuffer())) !== imageSha256) throw Error('object-integrity')
      await finishStage('image')
    }
    await active()
    const complete:SnapshotRecord = {...record,status:imageKey?'complete':'partial',imageStored:!!imageKey,imageKey,imageSha256,imageMediaType:imageKey?'image/jpeg':undefined,imageNote:imageKey?undefined:remedy,completedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
    await store.save(complete)
    await db.prepare("UPDATE snapshot_jobs SET state=?,updated=?,reason=? WHERE order_id=? AND claimed=?").bind(imageKey?'complete':'partial',Date.now(),imageKey?null:'image_unavailable',requestId,claim).run()
  } catch {
    await store.save({...record,status:record.report?'partial':'failed',publicError:record.report?remedy:'Your order needs a delivery review. Contact snapshot@eidos-works.com with your checkout email.',imageNote:record.report?remedy:undefined,updatedAt:new Date().toISOString()})
    await db.prepare("UPDATE snapshot_jobs SET state='review',reason='provider_or_storage_outcome',updated=? WHERE order_id=? AND claimed=?").bind(Date.now(),requestId,claim).run()
  }
}
export async function drainSnapshotJobs(env: SnapshotEnv) {
  if(!snapshotReady(env)) return
  const store=getSnapshotStore(env,new Request('https://eidos-works.com'))!,db=env.SNAPSHOT_DB!
  await db.batch([
    db.prepare("UPDATE snapshot_orders SET status=CASE WHEN json_type(record,'$.report')='object' THEN 'partial' ELSE 'failed' END WHERE status IN ('paid','processing') AND id IN(SELECT order_id FROM snapshot_jobs WHERE state='running' AND updated<?)").bind(Date.now()-15*60_000),
    db.prepare("UPDATE snapshot_jobs SET state='review',reason='worker_interrupted' WHERE state='running' AND updated<?").bind(Date.now()-15*60_000),
  ])
  const jobs=await db.prepare("SELECT order_id FROM snapshot_jobs WHERE state='queued' ORDER BY updated LIMIT 2").all<{order_id:string}>()
  for(const job of jobs.results) await generateSnapshot(job.order_id,store,env)
}
