import { cleanString, isRecord, withTimeout } from './http'
import type { SnapshotEnv, SnapshotRecord } from './types'

const COMMAND_CENTER_TIMEOUT_MS = 5_000
const MAX_RESPONSE_BYTES = 4_096

function resultUrl(env: SnapshotEnv, resultToken: string) {
  let origin = 'https://eidos-works.com'
  try {
    const configured = new URL(cleanString(env.PUBLIC_SITE_URL, 500) || origin)
    if (configured.protocol === 'https:' || configured.hostname === 'localhost') origin = configured.origin
  } catch {
    // Keep the canonical production origin.
  }
  return `${origin}/snapshot/result/${encodeURIComponent(resultToken)}`
}
async function readBoundedJson(response: Response) {
  if (!response.body) return null
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel('response-too-large')
        return null
      }
      chunks.push(decoder.decode(value, { stream: true }))
    }
    chunks.push(decoder.decode())
  } finally {
    reader.releaseLock()
  }
  try {
    return JSON.parse(chunks.join('')) as unknown
  } catch {
    return null
  }
}

export async function notifyCommandCenter(
  env: SnapshotEnv,
  record: SnapshotRecord,
  update: {
    paymentStatus: string
    reportStatus: 'queued' | 'complete' | 'failed'
    notes: string
  },
) {
  const webhookUrl = cleanString(env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL, 2_048)
  const sharedSecret = cleanString(env.COMMAND_CENTER_SHARED_SECRET, 500)
  if (!webhookUrl || sharedSecret.length < 24) return false

  try {
    const url = new URL(webhookUrl)
    if (url.protocol !== 'https:') return false
    const response = await withTimeout(COMMAND_CENTER_TIMEOUT_MS, (signal) =>
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sharedSecret,
          eventType: 'snapshot_order',
          data: {
            createdDate: record.createdAt,
            email: record.intake.email,
            businessName: record.intake.businessName,
            websiteUrl: record.intake.websiteUrl,
            primaryGoal: record.intake.primaryGoal,
            stylePreference: record.intake.stylePreference,
            paymentStatus: cleanString(update.paymentStatus, 80),
            reportStatus: update.reportStatus,
            resultUrl: resultUrl(env, record.resultToken),
            followUpStatus: 'not started',
            notes: cleanString(update.notes, 1_800),
          },
        }),
        signal,
      }),
    )
    if (!response.ok) return false
    const body = await readBoundedJson(response)
    return isRecord(body) && body.ok === true
  } catch {
    return false
  }
}
