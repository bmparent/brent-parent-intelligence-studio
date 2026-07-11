import { json, optionsResponse, publicFailure, readJsonBody, RequestBodyError } from '../../_shared/snapshot/http'
import { getSnapshotStore, isLocalDevelopmentRequest } from '../../_shared/snapshot/storage'
import { isStripeConfigured, snapshotPriceCents } from '../../_shared/snapshot/stripe'
import type { PagesFunctionContext, SnapshotRecord } from '../../_shared/snapshot/types'
import { validateSnapshotIntake } from '../../_shared/snapshot/validation'

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export const onRequestOptions = optionsResponse

export const onRequestPost = async ({ request, env }: PagesFunctionContext) => {
  const localDevelopment = isLocalDevelopmentRequest(request)
  if (!localDevelopment && env.SNAPSHOT_PUBLIC_ENABLED?.trim().toLowerCase() !== 'true') {
    return publicFailure('Eidos Snapshot is not accepting public orders yet.', 503)
  }

  const store = getSnapshotStore(env, request)
  if (!store) {
    return publicFailure('Eidos Snapshot storage is not configured yet. Please try again after setup is complete.', 503)
  }

  let body: unknown
  try {
    body = await readJsonBody(request)
  } catch (error) {
    if (error instanceof RequestBodyError) return publicFailure(error.publicMessage, error.status)
    return publicFailure('The request could not be read.', 400)
  }

  const validation = validateSnapshotIntake(body)
  if (!validation.value) {
    return json(
      {
        ok: false,
        message: 'Please correct the highlighted Snapshot details.',
        errors: validation.errors,
      },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()
  const record: SnapshotRecord = {
    version: 1,
    requestId: `snap_${randomToken(24)}`,
    resultToken: randomToken(32),
    status: 'created',
    intake: validation.value,
    createdAt: now,
    updatedAt: now,
  }

  await store.create(record)
  const developmentBypass =
    localDevelopment && env.SNAPSHOT_DEV_BYPASS_PAYMENT?.trim().toLowerCase() === 'true'

  return json(
    {
      ok: true,
      requestId: record.requestId,
      resultToken: record.resultToken,
      status: record.status,
      priceCents: snapshotPriceCents(env),
      currency: 'usd',
      checkoutConfigured: isStripeConfigured(env) || developmentBypass,
      storage: store.kind,
    },
    { status: 201 },
  )
}
