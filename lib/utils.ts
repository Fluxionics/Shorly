import { customAlphabet } from 'nanoid'

// URL-safe alphabet, no confusing chars (0,O,l,1)
const nanoid = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 7)

export function generateSlug(): string {
  return nanoid()
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]{3,50}$/.test(slug)
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function getShortUrl(slug: string): string {
  return `${getAppUrl()}/${slug}`
}

export const PLAN_LIMITS = {
  free: {
    links_per_month: 50,
    analytics_days: 7,
    password_protection: false,
    expiration: false,
    custom_slug: false,
    qr_code: true,
    api_access: false,
  },
  pro: {
    links_per_month: Infinity,
    analytics_days: 365,
    password_protection: true,
    expiration: true,
    custom_slug: true,
    qr_code: true,
    api_access: false,
  },
  business: {
    links_per_month: Infinity,
    analytics_days: 365,
    password_protection: true,
    expiration: true,
    custom_slug: true,
    qr_code: true,
    api_access: true,
  },
}
