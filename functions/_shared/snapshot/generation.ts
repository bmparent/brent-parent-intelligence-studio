import { capturePublicPage } from './capture'
import { notifyCommandCenter } from './commandCenter'
import { generateConceptImage, generateStructuredReport } from './openai'
import type { SnapshotStore } from './storage'
import type { SnapshotEnv, SnapshotRecord } from './types'

const MAX_STORED_BASE64_CHARACTERS = 900_000
const PROCESSING_LEASE_MS = 5 * 60 * 1000
const PUBLIC_GENERATION_ERROR =
  'We could not finish this Snapshot automatically. Please contact snapshot@eidos-works.com so the order can be reviewed.'

function withUpdate(record: SnapshotRecord, update: Partial<SnapshotRecord>): SnapshotRecord {
  return { ...record, ...update, updatedAt: new Date().toISOString() }
}

export async function generateSnapshot(requestId: string, store: SnapshotStore, env: SnapshotEnv) {
  const initialRecord = await store.getByRequestId(requestId)
  if (!initialRecord) return
  if (initialRecord.status === 'complete' || initialRecord.status === 'failed') return
  const processingLeaseExpired =
    initialRecord.status === 'processing' &&
    (!initialRecord.processingStartedAt ||
      !Number.isFinite(Date.parse(initialRecord.processingStartedAt)) ||
      Date.now() - Date.parse(initialRecord.processingStartedAt) >= PROCESSING_LEASE_MS)
  if (initialRecord.status === 'processing' && !processingLeaseExpired) return
  if (initialRecord.status !== 'paid' && !processingLeaseExpired) return

  const processingStartedAt = new Date().toISOString()
  let record = withUpdate(initialRecord, {
    status: 'processing',
    processingStartedAt,
    publicError: undefined,
  })
  try {
    await store.save(record)
  } catch {
    return
  }

  try {
    const capture = await capturePublicPage(record.intake.websiteUrl)
    record = withUpdate(record, { captureNote: capture.note })

    const report = await generateStructuredReport(env, record.intake, capture.page)
    const image = await generateConceptImage(env, report, record.intake)

    let imageStored = false
    let imageBase64: string | undefined
    let imageNote = image.note
    if (image.base64Image) {
      if (image.base64Image.length <= MAX_STORED_BASE64_CHARACTERS) {
        imageBase64 = image.base64Image
        imageStored = true
      } else {
        imageNote =
          'The visual concept was generated but exceeded the safe Snapshot KV payload limit. Configure object storage before retaining larger concept files.'
      }
    }

    record = withUpdate(record, {
      status: 'complete',
      report,
      imageStored,
      imageMediaType: imageStored ? image.mediaType : undefined,
      imageBase64,
      imageNote,
      completedAt: new Date().toISOString(),
      processingStartedAt: undefined,
      publicError: undefined,
    })
    await store.save(record)
    await notifyCommandCenter(env, record, {
      paymentStatus: record.paidAt ? 'paid' : 'unknown',
      reportStatus: 'complete',
      notes: [record.captureNote, record.imageNote].filter(Boolean).join(' '),
    })
  } catch {
    record = withUpdate(record, {
      status: 'failed',
      processingStartedAt: undefined,
      publicError: PUBLIC_GENERATION_ERROR,
    })
    await store.save(record)
    await notifyCommandCenter(env, record, {
      paymentStatus: record.paidAt ? 'paid' : 'unknown',
      reportStatus: 'failed',
      notes: record.publicError ?? PUBLIC_GENERATION_ERROR,
    })
  }
}
