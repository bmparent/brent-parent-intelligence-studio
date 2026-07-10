import { withTimeout } from './http'
import { isBlockedHostname, isIpLiteral, normalizePublicHttpUrl } from './validation'
import type { CapturedPage } from './types'

const DNS_TIMEOUT_MS = 3_500
const FETCH_TIMEOUT_MS = 9_000
const MAX_REDIRECTS = 3
const MAX_HTML_BYTES = 90_000
const MAX_VISIBLE_TEXT = 18_000

export const SCREENSHOT_UNAVAILABLE_NOTE =
  'Screenshot capture was unavailable, so this Snapshot is based on the provided URL and extracted page content.'

export interface CaptureOutcome {
  page?: CapturedPage
  note: string
}

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x')) {
      const point = Number.parseInt(code.slice(2), 16)
      return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : entity
    }
    if (code.startsWith('#')) {
      const point = Number.parseInt(code.slice(1), 10)
      return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : entity
    }
    return named[code.toLowerCase()] ?? entity
  })
}

function textOnly(value: string, maxLength: number) {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function metaDescriptionFromTag(tag: string) {
  const boundedTag = tag.slice(0, 4_096)
  const name = boundedTag.match(/\b(?:name|property)\s*=\s*["']?([^\s"'>]+)/i)?.[1]?.toLowerCase()
  if (name !== 'description' && name !== 'og:description') return ''
  const content = boundedTag.match(/\bcontent\s*=\s*(?:["']([^"']*)["']|([^\s>]+))/i)
  return textOnly(content?.[1] ?? content?.[2] ?? '', 420)
}

function scanHtml(html: string) {
  const lowerHtml = html.toLowerCase()
  const headings: string[] = []
  const linkLabels: string[] = []
  const visibleParts: string[] = []
  let visibleLength = 0
  let metaDescription = ''
  let title = ''
  let titleBuffer = ''
  let titleCapture = false
  let headingCapture: { tag: string; text: string } | null = null
  let linkCapture: string | null = null
  let index = 0

  const appendText = (rawText: string) => {
    if (!rawText) return
    const normalized = decodeHtmlEntities(rawText).replace(/\s+/g, ' ').trim()
    if (!normalized) return

    if (titleCapture && titleBuffer.length < 500) titleBuffer += ` ${normalized}`
    if (headingCapture && headingCapture.text.length < 500) headingCapture.text += ` ${normalized}`
    if (linkCapture !== null && linkCapture.length < 300) linkCapture += ` ${normalized}`
    if (visibleLength < MAX_VISIBLE_TEXT) {
      const part = normalized.slice(0, MAX_VISIBLE_TEXT - visibleLength)
      visibleParts.push(part)
      visibleLength += part.length + 1
    }
  }

  while (index < html.length) {
    const open = html.indexOf('<', index)
    if (open < 0) {
      appendText(html.slice(index, Math.min(html.length, index + MAX_VISIBLE_TEXT)))
      break
    }
    appendText(html.slice(index, open))

    if (html.startsWith('<!--', open)) {
      const commentEnd = html.indexOf('-->', open + 4)
      if (commentEnd < 0) break
      index = commentEnd + 3
      continue
    }

    const close = html.indexOf('>', open + 1)
    if (close < 0) break
    const tagSource = html.slice(open + 1, Math.min(close, open + 257))
    const closing = /^\s*\//.test(tagSource)
    const tagName = tagSource.match(/^\s*\/?\s*([a-z\d]+)/i)?.[1]?.toLowerCase() ?? ''
    index = close + 1
    if (!tagName) continue

    if (!closing && ['script', 'style', 'noscript', 'template', 'svg'].includes(tagName)) {
      const closingStart = lowerHtml.indexOf(`</${tagName}`, index)
      if (closingStart < 0) break
      const closingEnd = html.indexOf('>', closingStart + tagName.length + 2)
      if (closingEnd < 0) break
      index = closingEnd + 1
      continue
    }

    if (!closing && tagName === 'meta' && !metaDescription) {
      metaDescription = metaDescriptionFromTag(html.slice(open + 1, close))
      continue
    }

    if (!closing && tagName === 'title' && !title) {
      titleBuffer = ''
      titleCapture = true
      continue
    }
    if (closing && tagName === 'title' && !title) {
      title = textOnly(titleBuffer, 240)
      titleBuffer = ''
      titleCapture = false
      continue
    }

    if (!closing && /^h[1-3]$/.test(tagName) && headings.length < 24) {
      headingCapture = { tag: tagName, text: '' }
      continue
    }
    if (closing && headingCapture?.tag === tagName) {
      const value = textOnly(headingCapture.text, 220)
      if (value) headings.push(value)
      headingCapture = null
      continue
    }

    if (!closing && tagName === 'a' && linkLabels.length < 24) {
      linkCapture = ''
      continue
    }
    if (closing && tagName === 'a' && linkCapture !== null) {
      const value = textOnly(linkCapture, 120)
      if (value.length > 1) linkLabels.push(value)
      linkCapture = null
    }
  }

  return {
    title,
    metaDescription,
    headings,
    linkLabels,
    visibleText: visibleParts.join(' ').replace(/\s+/g, ' ').trim().slice(0, MAX_VISIBLE_TEXT),
  }
}

function parsePage(html: string, finalUrl: string): CapturedPage {
  const scanned = scanHtml(html)
  return {
    finalUrl,
    ...scanned,
  }
}

async function readLimitedText(response: Response) {
  const declaredLength = Number(response.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES) {
    throw new Error('content-too-large')
  }

  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_HTML_BYTES) throw new Error('content-too-large')
      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel('capture-aborted').catch(() => undefined)
    throw error
  } finally {
    reader.releaseLock()
  }

  const merged = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged)
}

interface DnsJsonAnswer {
  type?: number
  data?: string
}

interface DnsJsonResponse {
  Status?: number
  Answer?: DnsJsonAnswer[]
}

async function resolvePublicHostname(hostname: string) {
  if (isBlockedHostname(hostname)) throw new Error('blocked-host')
  if (isIpLiteral(hostname)) return

  const answers = await Promise.all(
    ['A', 'AAAA'].map((type) =>
      withTimeout(DNS_TIMEOUT_MS, async (signal) => {
        const endpoint = new URL('https://cloudflare-dns.com/dns-query')
        endpoint.searchParams.set('name', hostname)
        endpoint.searchParams.set('type', type)
        const response = await fetch(endpoint, {
          headers: { accept: 'application/dns-json' },
          signal,
        })
        if (!response.ok) throw new Error('dns-unavailable')
        return (await response.json()) as DnsJsonResponse
      }),
    ),
  )

  const addresses = answers
    .flatMap((answer) => answer.Answer ?? [])
    .filter((answer) => answer.type === 1 || answer.type === 28)
    .map((answer) => answer.data?.trim() ?? '')
    .filter(Boolean)

  if (!addresses.length || addresses.some((address) => isBlockedHostname(address))) {
    throw new Error('dns-not-public')
  }
}

async function fetchPublicHtml(initialUrl: string) {
  let currentUrl = normalizePublicHttpUrl(initialUrl)

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const parsed = new URL(currentUrl)
    await resolvePublicHostname(parsed.hostname)

    const result = await withTimeout(FETCH_TIMEOUT_MS, async (signal) => {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          accept: 'text/html,application/xhtml+xml;q=0.9',
          'user-agent': 'EidosSnapshot/1.0 (+https://eidos-works.com/snapshot)',
        },
        signal,
      })

      if (response.status >= 300 && response.status < 400) return { response }
      if (!response.ok) throw new Error('fetch-failed')
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error('not-html')
      }
      return { response, html: await readLimitedText(response) }
    })
    const { response } = result

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) throw new Error('redirect-failed')
      currentUrl = normalizePublicHttpUrl(new URL(location, currentUrl).toString())
      continue
    }

    return { html: result.html ?? '', finalUrl: currentUrl }
  }

  throw new Error('redirect-failed')
}

export async function capturePublicPage(websiteUrl: string): Promise<CaptureOutcome> {
  try {
    const { html, finalUrl } = await fetchPublicHtml(websiteUrl)
    const page = parsePage(html, finalUrl)
    if (!page.visibleText && !page.title && !page.headings.length) {
      return { note: SCREENSHOT_UNAVAILABLE_NOTE }
    }
    return { page, note: SCREENSHOT_UNAVAILABLE_NOTE }
  } catch {
    return {
      note: `${SCREENSHOT_UNAVAILABLE_NOTE} The site did not provide readable public page content during generation.`,
    }
  }
}
