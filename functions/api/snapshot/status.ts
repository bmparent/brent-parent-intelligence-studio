import { generateSnapshot } from '../../_shared/snapshot/generation'
import { json, optionsResponse, publicFailure } from '../../_shared/snapshot/http'
import { getSnapshotStore } from '../../_shared/snapshot/storage'
import type { PagesFunctionContext, SnapshotRecord } from '../../_shared/snapshot/types'
import { isValidResultToken } from '../../_shared/snapshot/validation'

function publicStatus(record: SnapshotRecord) {
  const messages: Record<SnapshotRecord['status'], string> = {
    created: 'Your Snapshot details are ready for secure checkout.',
    checkout_created: 'Payment has not been confirmed yet.',
    paid: 'Payment is confirmed. Your Snapshot is queued for generation.',
    processing: 'Your website content is being reviewed and your Snapshot is being prepared.',
    complete: 'Your Snapshot is ready.',
    failed: record.publicError || 'Your Snapshot needs a manual review.',
  }

  return {
    ok: true,
    status: record.status,
    message: messages[record.status],
    resultToken: record.resultToken,
    resultUrl: `/snapshot/result/${encodeURIComponent(record.resultToken)}`,
    businessName: record.intake.businessName,
    websiteUrl: record.intake.websiteUrl,
    request: {
      businessName: record.intake.businessName,
      websiteUrl: record.intake.websiteUrl,
      primaryGoal: record.intake.primaryGoal,
      stylePreference: record.intake.stylePreference,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
    captureNote: record.captureNote,
    captureNotice: [record.captureNote, record.imageNote].filter(Boolean).join(' ') || undefined,
    imageNote: record.imageNote,
    report: record.status === 'complete' ? record.report : undefined,
  }
}

export const onRequestOptions = optionsResponse

export const onRequestGet = async (context: PagesFunctionContext) => {
  const { request, env } = context
  const store = getSnapshotStore(env, request)
  if (!store) return publicFailure('Eidos Snapshot storage is not configured yet.', 503)

  const token = new URL(request.url).searchParams.get('token')
  if (!isValidResultToken(token)) return publicFailure('A valid Snapshot result token is required.', 400)

  let record = await store.getByResultToken(token)
  if (!record) return publicFailure('This Snapshot result could not be found or has expired.', 404)

  const processingLeaseExpired =
    record.status === 'processing' &&
    (!record.processingStartedAt ||
      !Number.isFinite(Date.parse(record.processingStartedAt)) ||
      Date.now() - Date.parse(record.processingStartedAt) >= 5 * 60 * 1000)
  if (record.status === 'paid' || processingLeaseExpired) {
    await generateSnapshot(record.requestId, store, env)
    record = (await store.getByResultToken(token)) ?? record
  }

  const response: Record<string, unknown> = publicStatus(record)
  if (record.status === 'complete' && record.imageStored && record.imageBase64) {
    response.conceptImage = `data:${record.imageMediaType ?? 'image/jpeg'};base64,${record.imageBase64}`
  }

  return json(response)
}
