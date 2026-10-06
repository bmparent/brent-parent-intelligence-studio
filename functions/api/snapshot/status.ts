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
    partial: 'Your written report is available. The concept image needs a delivery review.',
    refunded: 'This order was refunded. Delivery access is closed.',
    disputed: 'This order is under payment review. Delivery access is paused.',
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
    report: ['complete','partial'].includes(record.status) ? record.report : undefined,
  }
}

export const onRequestOptions = optionsResponse

export const onRequestGet = async (context: PagesFunctionContext) => {
  const { request, env } = context
  const store = getSnapshotStore(env, request)
  if (!store) return publicFailure('Eidos Snapshot storage is not configured yet.', 503)

  const token = new URL(request.url).searchParams.get('token')
  if (!isValidResultToken(token)) return publicFailure('A valid Snapshot result token is required.', 400)

  const record = await store.getByResultToken(token)
  if (!record) return publicFailure('This Snapshot result could not be found or has expired.', 404)

  const response: Record<string, unknown> = publicStatus(record)
  if(record.status==='complete' && record.imageKey) response.conceptImage = `/api/snapshot/image?token=${encodeURIComponent(token)}`
  if (record.status === 'complete' && record.imageStored && record.imageBase64) {
    response.conceptImage = `data:${record.imageMediaType ?? 'image/jpeg'};base64,${record.imageBase64}`
  }

  return json(response)
}
