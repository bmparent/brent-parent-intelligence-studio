import { notifyCommandCenter } from '../../_shared/snapshot/commandCenter'
import { isRecord, json, optionsResponse, publicFailure, readJsonBody, RequestBodyError } from '../../_shared/snapshot/http'
import { getSnapshotStore, isLocalDevelopmentRequest } from '../../_shared/snapshot/storage'
import { createStripeCheckout, isStripeConfigured } from '../../_shared/snapshot/stripe'
import type { PagesFunctionContext } from '../../_shared/snapshot/types'
import { isValidRequestId } from '../../_shared/snapshot/validation'

function resultUrl(resultToken: string) {
  return `/snapshot/result/${encodeURIComponent(resultToken)}`
}

export const onRequestOptions = optionsResponse

export const onRequestPost = async (context: PagesFunctionContext) => {
  const { request, env } = context
  const store = getSnapshotStore(env, request)
  if (!store) return publicFailure('Eidos Snapshot storage is not configured yet.', 503)

  let body: unknown
  try {
    body = await readJsonBody(request, 2_000)
  } catch (error) {
    if (error instanceof RequestBodyError) return publicFailure(error.publicMessage, error.status)
    return publicFailure('The checkout request could not be read.', 400)
  }

  const requestId = isRecord(body) ? body.requestId : undefined
  if (!isValidRequestId(requestId)) return publicFailure('The Snapshot checkout request is invalid.', 400)

  const record = await store.getByRequestId(requestId)
  if (!record) return publicFailure('This Snapshot request could not be found or has expired.', 404)

  if (
    record.status === 'complete' ||
    record.status === 'processing' ||
    record.status === 'paid' ||
    (record.status === 'failed' && Boolean(record.paidAt))
  ) {
    return json({
      ok: true,
      status: record.status,
      resultToken: record.resultToken,
      resultUrl: resultUrl(record.resultToken),
    })
  }

  const developmentBypass =
    isLocalDevelopmentRequest(request) && env.SNAPSHOT_DEV_BYPASS_PAYMENT?.trim().toLowerCase() === 'true'

  if (developmentBypass) {
    const now = new Date().toISOString()
    const paidRecord = { ...record, status: 'paid' as const, paidAt: now, updatedAt: now }
    await store.save(paidRecord)
    context.waitUntil(
      notifyCommandCenter(env, paidRecord, {
        paymentStatus: 'development bypass',
        reportStatus: 'queued',
        notes: 'Local development payment bypass; no Stripe payment was taken.',
      }),
    )
    return json({
      ok: true,
      developmentBypass: true,
      status: 'paid',
      resultToken: record.resultToken,
      checkoutUrl: `/snapshot/success?token=${encodeURIComponent(record.resultToken)}&dev=1`,
      resultUrl: resultUrl(record.resultToken),
    })
  }

  if (!isStripeConfigured(env)) {
    return publicFailure('Secure Snapshot checkout is not configured yet. No payment was taken.', 503)
  }

  if (record.status === 'checkout_created' && record.stripeCheckoutUrl) {
    return json({
      ok: true,
      status: record.status,
      resultToken: record.resultToken,
      checkoutUrl: record.stripeCheckoutUrl,
    })
  }

  try {
    const checkout = await createStripeCheckout(env, record)
    const checkoutRecord = {
      ...record,
      status: 'checkout_created' as const,
      stripeSessionId: checkout.id,
      stripeCheckoutUrl: checkout.url,
      updatedAt: new Date().toISOString(),
    }
    await store.save(checkoutRecord)
    return json({
      ok: true,
      status: checkoutRecord.status,
      resultToken: record.resultToken,
      checkoutUrl: checkout.url,
    })
  } catch {
    return publicFailure('Secure checkout could not be started. No payment was taken.', 502)
  }
}
