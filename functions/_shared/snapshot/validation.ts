import { cleanString, isRecord } from './http'
import {
  PRIMARY_GOALS,
  STYLE_PREFERENCES,
  type PrimaryGoal,
  type SnapshotIntake,
  type StylePreference,
} from './types'

export interface IntakeValidationResult {
  value?: SnapshotIntake
  errors: Record<string, string>
}

function parseIpv4(value: string) {
  const parts = value.split('.')
  if (parts.length !== 4) return null

  const octets = parts.map((part) => Number(part))
  if (octets.some((part, index) => !/^\d{1,3}$/.test(parts[index]) || part < 0 || part > 255)) return null

  return (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3]) >>> 0
}

function ipv4InRange(value: number, base: string, prefix: number) {
  const baseValue = parseIpv4(base)
  if (baseValue === null) return false
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (value & mask) === (baseValue & mask)
}

export function isBlockedIpv4(hostname: string) {
  const value = parseIpv4(hostname)
  if (value === null) return false

  const blocked: Array<[string, number]> = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.0.2.0', 24],
    ['192.88.99.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['198.51.100.0', 24],
    ['203.0.113.0', 24],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
  ]

  return blocked.some(([base, prefix]) => ipv4InRange(value, base, prefix))
}

function parseIpv6Bytes(rawHostname: string) {
  let hostname = rawHostname.replace(/^\[|\]$/g, '').split('%')[0].toLowerCase()
  if (!hostname.includes(':')) return null

  const dotted = hostname.match(/(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1]
  if (dotted) {
    const ipv4 = parseIpv4(dotted)
    if (ipv4 === null) return null
    hostname = `${hostname.slice(0, -dotted.length)}${((ipv4 >>> 16) & 0xffff).toString(16)}:${(
      ipv4 & 0xffff
    ).toString(16)}`
  }

  if ((hostname.match(/::/g) ?? []).length > 1) return null
  const hasCompression = hostname.includes('::')
  const [leftRaw, rightRaw = ''] = hostname.split('::')
  const left = leftRaw ? leftRaw.split(':') : []
  const right = rightRaw ? rightRaw.split(':') : []
  if ([...left, ...right].some((part) => !/^[\da-f]{1,4}$/.test(part))) return null

  const omitted = 8 - left.length - right.length
  if ((!hasCompression && omitted !== 0) || (hasCompression && omitted < 1)) return null
  const parts = [...left, ...Array.from({ length: omitted }, () => '0'), ...right]
  if (parts.length !== 8) return null

  return parts.flatMap((part) => {
    const value = Number.parseInt(part, 16)
    return [value >>> 8, value & 255]
  })
}

export function isBlockedIpv6(rawHostname: string) {
  const bytes = parseIpv6Bytes(rawHostname)
  if (!bytes) return false

  const allZero = bytes.every((value) => value === 0)
  const loopback = bytes.slice(0, 15).every((value) => value === 0) && bytes[15] === 1
  if (allZero || loopback) return true

  const ipv4Compatible = bytes.slice(0, 12).every((value) => value === 0)
  const ipv4Mapped = bytes.slice(0, 10).every((value) => value === 0) && bytes[10] === 0xff && bytes[11] === 0xff
  if (ipv4Compatible || ipv4Mapped) return isBlockedIpv4(bytes.slice(12).join('.'))

  if ((bytes[0] & 0xfe) === 0xfc) return true // unique-local fc00::/7
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return true // link-local fe80::/10
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0xc0) return true // deprecated site-local fec0::/10
  if (bytes[0] === 0xff) return true // multicast
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return true // 6to4
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) return true // Teredo
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x0d && bytes[3] === 0xb8) return true // documentation
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x00 && [0x10, 0x20].includes(bytes[3] & 0xf0)) {
    return true // ORCHID ranges
  }
  if (bytes[0] === 0x00 && bytes[1] === 0x64 && bytes[2] === 0xff && bytes[3] === 0x9b) return true // NAT64
  return false
}

export function isIpLiteral(hostname: string) {
  const cleanHostname = hostname.replace(/^\[|\]$/g, '')
  return parseIpv4(cleanHostname) !== null || cleanHostname.includes(':')
}

export function isBlockedHostname(rawHostname: string) {
  const hostname = rawHostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '')
  if (!hostname) return true
  if (isBlockedIpv4(hostname) || isBlockedIpv6(hostname)) return true

  const blockedNames = ['localhost', 'localhost.localdomain', 'metadata.google.internal']
  const blockedSuffixes = ['.localhost', '.local', '.internal', '.home', '.lan', '.test', '.invalid', '.onion']
  return blockedNames.includes(hostname) || blockedSuffixes.some((suffix) => hostname.endsWith(suffix))
}

export function normalizePublicHttpUrl(value: unknown) {
  const input = cleanString(value, 2048)
  if (!input) throw new Error('Website URL is required.')

  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    throw new Error('Enter a valid public website URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only public http and https website URLs are allowed.')
  }
  if (url.username || url.password) throw new Error('Website URLs cannot include credentials.')
  if (url.port && !((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443'))) {
    throw new Error('Website URLs must use the standard http or https port.')
  }
  if (isBlockedHostname(url.hostname)) throw new Error('Private or local network addresses are not allowed.')

  url.hash = ''
  url.username = ''
  url.password = ''
  return url.toString()
}

export function validateSnapshotIntake(raw: unknown): IntakeValidationResult {
  const errors: Record<string, string> = {}
  const body = isRecord(raw) ? raw : {}

  let websiteUrl = ''
  try {
    websiteUrl = normalizePublicHttpUrl(body.websiteUrl)
  } catch (error) {
    errors.websiteUrl = error instanceof Error ? error.message : 'Enter a valid public website URL.'
  }

  const businessName = cleanString(body.businessName, 140)
  const industry = cleanString(body.industry, 120)
  const biggestIssue = cleanString(body.biggestIssue, 700)
  const email = cleanString(body.email, 254).toLowerCase()
  const primaryGoal = cleanString(body.primaryGoal, 80)
  const stylePreference = cleanString(body.stylePreference, 80)

  if (businessName.length < 2) errors.businessName = 'Business name is required.'
  if (!PRIMARY_GOALS.includes(primaryGoal as PrimaryGoal)) errors.primaryGoal = 'Choose a valid primary goal.'
  if (stylePreference && !STYLE_PREFERENCES.includes(stylePreference as StylePreference)) {
    errors.stylePreference = 'Choose a valid style preference.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.'
  if (body.consent !== true) errors.consent = 'Consent is required before generating a Snapshot.'

  if (Object.keys(errors).length) return { errors }

  return {
    errors,
    value: {
      websiteUrl,
      businessName,
      industry,
      primaryGoal: primaryGoal as PrimaryGoal,
      stylePreference: stylePreference as StylePreference | '',
      biggestIssue,
      email,
      consent: true,
    },
  }
}

export function isValidRequestId(value: unknown): value is string {
  return typeof value === 'string' && /^snap_[A-Za-z0-9_-]{30,80}$/.test(value)
}

export function isValidResultToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{40,90}$/.test(value)
}
