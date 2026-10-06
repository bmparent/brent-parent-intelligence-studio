import type { KVNamespaceLike, SnapshotEnv, SnapshotRecord } from './types'

const REQUEST_TTL_SECONDS = 60 * 60 * 24 * 30
const UNPAID_REQUEST_TTL_SECONDS = 60 * 60 * 24 * 2
const STRIPE_EVENT_TTL_SECONDS = 60 * 60 * 24 * 7

const memoryValues = new Map<string, string>()

interface SnapshotStorageAdapter {
  readonly kind: 'kv' | 'memory-dev'
  get(key: string): Promise<string | null>
  put(key: string, value: string, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
}

class KvStorageAdapter implements SnapshotStorageAdapter {
  readonly kind = 'kv' as const

  constructor(private readonly kv: KVNamespaceLike) {}

  get(key: string) {
    return this.kv.get(key)
  }

  put(key: string, value: string, ttlSeconds: number) {
    return this.kv.put(key, value, { expirationTtl: ttlSeconds })
  }

  delete(key: string) {
    return this.kv.delete(key)
  }
}

class MemoryDevStorageAdapter implements SnapshotStorageAdapter {
  readonly kind = 'memory-dev' as const

  async get(key: string) {
    return memoryValues.get(key) ?? null
  }

  async put(key: string, value: string) {
    memoryValues.set(key, value)
  }

  async delete(key: string) {
    memoryValues.delete(key)
  }
}

function requestBaseKey(requestId: string) {
  return `snapshot:request:${requestId}:base`
}

function requestStageKey(requestId: string, stage: Exclude<SnapshotRecord['status'], 'created'>) {
  return `snapshot:request:${requestId}:stage:${stage}`
}

function initialTokenKey(resultToken: string) {
  return `snapshot:result-token:${resultToken}:initial`
}

function paidTokenKey(resultToken: string) {
  return `snapshot:result-token:${resultToken}:paid`
}

function stripeEventKey(eventId: string) {
  return `snapshot:stripe-event:${eventId}`
}

export class SnapshotStore {
  readonly kind: SnapshotStorageAdapter['kind'] | 'sql'

  constructor(private readonly adapter: SnapshotStorageAdapter, readonly database?: SnapshotEnv['SNAPSHOT_DB']) {
    this.kind = database ? 'sql' : adapter.kind
  }

  async create(record: SnapshotRecord) {
    if (this.database) {
      await this.database.prepare('INSERT INTO snapshot_orders(id,token,status,record,expires) VALUES(?,?,?,?,?)').bind(record.requestId,record.resultToken,record.status,JSON.stringify(record),Date.now()+UNPAID_REQUEST_TTL_SECONDS*1000).run()
      return
    }
    await Promise.all([
      this.adapter.put(requestBaseKey(record.requestId), JSON.stringify(record), UNPAID_REQUEST_TTL_SECONDS),
      this.adapter.put(initialTokenKey(record.resultToken), record.requestId, UNPAID_REQUEST_TTL_SECONDS),
    ])
  }

  async getByRequestId(requestId: string) {
    if (this.database) {
      const row = await this.database.prepare('SELECT record,status FROM snapshot_orders WHERE id=? AND expires>?').bind(requestId,Date.now()).first<{record:string;status:SnapshotRecord['status']}>()
      return row ? {...JSON.parse(row.record),status:row.status} as SnapshotRecord : null
    }
    const keys = [
      requestStageKey(requestId, 'complete'),
      requestStageKey(requestId, 'failed'),
      requestStageKey(requestId, 'processing'),
      requestStageKey(requestId, 'paid'),
      requestStageKey(requestId, 'checkout_created'),
      requestBaseKey(requestId),
    ]
    const values = await Promise.all(keys.map((key) => this.adapter.get(key)))
    for (const serialized of values) {
      if (!serialized) continue
      try {
        return JSON.parse(serialized) as SnapshotRecord
      } catch {
        continue
      }
    }
    return null
  }

  async getByResultToken(resultToken: string) {
    if (this.database) {
      const row = await this.database.prepare('SELECT id FROM snapshot_orders WHERE token=? AND expires>?').bind(resultToken,Date.now()).first<{id:string}>()
      return row ? this.getByRequestId(row.id) : null
    }
    const [paidRequestId, initialRequestId] = await Promise.all([
      this.adapter.get(paidTokenKey(resultToken)),
      this.adapter.get(initialTokenKey(resultToken)),
    ])
    const requestId = paidRequestId ?? initialRequestId
    if (!requestId) return null
    const record = await this.getByRequestId(requestId)
    return record?.resultToken === resultToken ? record : null
  }

  async save(record: SnapshotRecord) {
    if (record.status === 'created') throw new Error('created-records-are-immutable')
    if (this.database) {
      const statements = [this.database.prepare("UPDATE snapshot_orders SET status=?,record=?,payment_intent=COALESCE(?,payment_intent),expires=? WHERE id=? AND status NOT IN ('refunded','disputed','complete','partial') AND (status NOT IN ('processing','failed') OR ? NOT IN ('paid','checkout_created'))").bind(record.status,JSON.stringify(record),record.paymentIntent || null,Date.now()+REQUEST_TTL_SECONDS*1000,record.requestId,record.status)]
      if(record.status==='paid') {
        statements.push(this.database.prepare('UPDATE snapshot_orders SET status=(SELECT state FROM snapshot_revocations WHERE payment_intent=snapshot_orders.payment_intent) WHERE id=? AND payment_intent IN(SELECT payment_intent FROM snapshot_revocations)').bind(record.requestId))
        statements.push(this.database.prepare("INSERT OR IGNORE INTO snapshot_jobs(order_id,state,updated) SELECT id,'queued',? FROM snapshot_orders WHERE id=? AND status='paid'").bind(Date.now(),record.requestId))
      }
      await this.database.batch(statements)
      return
    }
    const ttl = record.status === 'checkout_created'
      ? UNPAID_REQUEST_TTL_SECONDS
      : REQUEST_TTL_SECONDS
    const writes = [
      this.adapter.put(requestStageKey(record.requestId, record.status), JSON.stringify(record), ttl),
    ]
    if (record.status === 'paid') {
      writes.push(this.adapter.put(paidTokenKey(record.resultToken), record.requestId, REQUEST_TTL_SECONDS))
    }
    await Promise.all(writes)
  }

  hasStripeEvent(eventId: string) {
    if(this.database) return this.database.prepare('SELECT id FROM snapshot_events WHERE id=?').bind(eventId).first()
    return this.adapter.get(stripeEventKey(eventId))
  }

  saveStripeEvent(eventId: string) {
    if(this.database) return this.database.prepare('INSERT OR IGNORE INTO snapshot_events(id,created) VALUES(?,?)').bind(eventId,Date.now()).run()
    return this.adapter.put(stripeEventKey(eventId), 'processed', STRIPE_EVENT_TTL_SECONDS)
  }
}

export function isLocalDevelopmentRequest(request: Request) {
  const hostname = new URL(request.url).hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function getSnapshotStore(env: SnapshotEnv, request: Request) {
  if (env.SNAPSHOT_DB) return new SnapshotStore(new MemoryDevStorageAdapter(), env.SNAPSHOT_DB)
  if (env.SNAPSHOT_STORE) return new SnapshotStore(new KvStorageAdapter(env.SNAPSHOT_STORE))
  if (isLocalDevelopmentRequest(request)) return new SnapshotStore(new MemoryDevStorageAdapter())
  return null
}
