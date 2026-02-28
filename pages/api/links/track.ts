import type { NextApiRequest, NextApiResponse } from 'next'
import { createHash } from 'crypto'
import { supabaseAdmin } from '../../../lib/supabase'

function parseUserAgent(ua: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(ua)
    ? /iPad/.test(ua) ? 'tablet' : 'mobile'
    : 'desktop'

  let browser = 'unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Opera')) browser = 'Opera'

  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { device, browser, os }
}

function getReferrerDomain(referer: string | undefined): string | null {
  if (!referer) return null
  try {
    return new URL(referer).hostname.replace('www.', '')
  } catch {
    return null
  }
}

async function getCountry(ip: string): Promise<string | null> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country_name/`, { signal: AbortSignal.timeout(2000) })
    const country = await res.text()
    return country.trim() || null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { linkId } = req.body
  if (!linkId) return res.status(400).json({ error: 'Missing linkId' })

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  const ipHash = createHash('sha256').update(ip + process.env.NEXT_PUBLIC_SUPABASE_URL).digest('hex')
  
  const ua = req.headers['user-agent'] || ''
  const referer = req.headers['referer'] || req.headers['referrer'] as string
  const { device, browser, os } = parseUserAgent(ua)
  const referrerDomain = getReferrerDomain(referer)

  // Check if this IP has clicked this link before (within last 24h)
  const supabase = supabaseAdmin()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: existingClick } = await supabase
    .from('clicks')
    .select('id')
    .eq('link_id', linkId)
    .eq('ip_hash', ipHash)
    .gte('clicked_at', since)
    .single()

  const isUnique = !existingClick

  // Get country (async, non-blocking if slow)
  const country = await getCountry(ip)

  // Record click
  await supabase.from('clicks').insert({
    link_id: linkId,
    ip_hash: ipHash,
    country,
    device,
    browser,
    os,
    referrer: referer || null,
    referrer_domain: referrerDomain,
    is_unique: isUnique,
  })

  return res.status(200).json({ ok: true })
}
