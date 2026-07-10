import { notifyCommandCenter } from '../../_shared/snapshot/commandCenter'
import {
  cleanString,
  isRecord,
  json,
  optionsResponse,
  publicFailure,
  readTextBodyLimited,
  RequestBodyError,
} from '../../_shared/snapshot/http'
import { getSnapshotStore } from '../../_shared/snapshot/storage'
import { parseStripeEvent, snapshotPriceCents, verifyStripeSignature } from '../../_shared/snapshot/stripe'
import type { PagesFunctionContext } from '../../_shared/snapshot/types'
import { isValidRequestId, isValidResultToken } from '../../_shared/snapshot/validation'

const MAX_WEBHOOK_BYTES = 512_000
const PAYMENT_REVIEW_ERROR =
  'Payment confirmation needs a manual review. Do not submit another payment; contact billing@eidos-works.com with the checkout email.'

export const onRequestOptions = optionsResponse

export const onRequestPost = async (context: PagesFunctionContext) => {
  const { request, env } = context
  const store = getSnapshotStore(env, request)
  if (!store) return publicFailure('Snapshot webhook storage is not configured.', 503)

  const webhookSecret = cleanString(env.STRIPE_WEBHOOK_SECRET, 500)
  if (!webhookSecret) return publicFailure('Snapshot webhook verification is not configured.', 503)

  let rawBody: string
  try {
    rawBody = await readTextBodyLimited(request, MAX_WEBHOOK_BYTES)
  } catch (error) {
    if (error instanceof RequestBodyError) return publicFailure(error.publicMessage, error.status)
    return publicFailure('Webhook request could not be read.', 400)
  }

  const signatureHeader = request.headers.get('stripe-signature') ?? ''
  if (!(await verifyStripeSignature(rawBody, signatureHeader, webhookSecret))) {
    return publicFailure('Webhook signature verification failed.', 400)
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody) as unknown
  } catch {
    return publicFailure('Webhook payload is invalid.', 400)
  }

  const event = parseStripeEvent(parsedBody)
  if (!event) return publicFailure('Webhook payload is invalid.', 400)
  if (await store.hasStripeEvent(event.id)) return json({ received: true, duplicate: true })

  try {
    if (event.type !== 'checkout.session.completed') {
      await store.saveStripeEvent(event.id)
      return json({ received: true, ignored: true })
    }

    const session = event.data.object
    const metadata = isRecord(session.metadata) ? session.metadata : {}
    const requestId = metadata.snapshot_request_id
    const resultToken = metadata.snapshot_result_token
    const paymentStatus = cleanString(session.payment_status, 40)
    const mode = cleanString(session.mode, 40)
    const currency = cleanString(session.currency, 12).toLowerCase()
    const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : -1

    if (!isValidRequestId(requestId) || !isValidResultToken(resultToken)) {
      await store.saveStripeEvent(event.id)
      return json({ received: true, ignored: true })
    }

    const record = await store.getByRequestId(requestId)
    if (!record) throw new Error('snapshot-record-missing')
    if (record.resultToken !== resultToken) {
      await store.saveStripeEvent(event.id)
      return json({ received: true, ignored: true })
    }

    const sessionId = cleanString(session.id, 240)
    if (record.stripeSessionId && record.stripeSessionId !== sessionId) {
      throw new Error('stripe-session-mismatch')
    }

    if (
      paymentStatus !== 'paid' ||
      mode !== 'payment' ||
      currency !== 'usd' ||
      amountTotal !== snapshotPriceCents(env)
    ) {
      if (paymentStatus === 'paid') {
        const now = new Date().toISOString()
        const paidRecord = {
          ...record,
          status: 'paid' as const,
          paidAt: record.paidAt ?? now,
          stripeSessionId: sessionId,
          stripeCheckoutUrl: undefined,
          updatedAt: now,
          publicError: PAYMENT_REVIEW_ERROR,
        }
        await store.save(paidRecord)
        const failedRecord = { ...paidRecord, status: 'failed' as const, updatedAt: new Date().toISOString() }
        await store.save(failedRecord)
        context.waitUntil(
          notifyCommandCenter(env, failedRecord, {
            paymentStatus: 'paid — manual review',
            reportStatus: 'failed',
            notes: PAYMENT_REVIEW_ERROR,
          }),
        )
      }
      throw new Error('stripe-payment-mismatch')
    }

    const shouldMarkPaid = record.status !== 'complete' && record.status !== 'processing'
    if (shouldMarkPaid) {
      const now = new Date().toISOString()
      const paidRecord = {
        ...record,
        status: 'paid',
        paidAt: record.paidAt ?? now,
        stripeSessionId: sessionId,
        stripeCheckoutUrl: undefined,
        updatedAt: now,
        publicError: undefined,
      } as const
      await store.save(paidRecord)
      context.waitUntil(
        notifyCommandCenter(env, paidRecord, {
          paymentStatus: 'paid',
          reportStatus: 'queued',
          notes: 'Stripe payment confirmed; Snapshot report queued.',
        }),
      )
    }

    await store.saveStripeEvent(event.id)
    return json({ received: true })
  } catch {
    return publicFailure('Webhook processing could not be completed.', 500)
  }
}
