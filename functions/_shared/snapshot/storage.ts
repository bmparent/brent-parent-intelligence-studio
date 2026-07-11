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
  readonly kind: SnapshotStorageAdapter['kind']

  constructor(private readonly adapter: SnapshotStorageAdapter) {
    this.kind = adapter.kind
  }

  async create(record: SnapshotRecord) {
    await Promise.all([
      this.adapter.put(requestBaseKey(record.requestId), JSON.stringify(record), UNPAID_REQUEST_TTL_SECONDS),
      this.adapter.put(initialTokenKey(record.resultToken), record.requestId, UNPAID_REQUEST_TTL_SECONDS),
    ])
  }

  async getByRequestId(requestId: string) {
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
    return this.adapter.get(stripeEventKey(eventId))
  }

  saveStripeEvent(eventId: string) {
    return this.adapter.put(stripeEventKey(eventId), 'processed', STRIPE_EVENT_TTL_SECONDS)
  }
}

export function isLocalDevelopmentRequest(request: Request) {
  const hostname = new URL(request.url).hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function getSnapshotStore(env: SnapshotEnv, request: Request) {
  if (env.SNAPSHOT_STORE) return new SnapshotStore(new KvStorageAdapter(env.SNAPSHOT_STORE))
  if (isLocalDevelopmentRequest(request)) return new SnapshotStore(new MemoryDevStorageAdapter())
  return null
}
