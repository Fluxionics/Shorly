import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateSlug, isValidSlug, isValidUrl, PLAN_LIMITS } from '../../lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url, customSlug } = req.body
  if (!url || !isValidUrl(url)) return res.status(400).json({ error: 'Invalid URL' })

  // Get auth token from cookie/header
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  // Get profile and check plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const limits = PLAN_LIMITS[profile?.plan as keyof typeof PLAN_LIMITS || 'free']

  // Check monthly link limit
  if (limits.links_per_month !== Infinity && (profile?.links_this_month || 0) >= limits.links_per_month) {
    return res.status(403).json({ error: `Monthly limit reached (${limits.links_per_month} links). Upgrade to Pro for unlimited links.` })
  }

  // Validate custom slug
  if (customSlug) {
    if (!limits.custom_slug) {
      return res.status(403).json({ error: 'Custom slugs require a Pro plan' })
    }
    if (!isValidSlug(customSlug)) {
      return res.status(400).json({ error: 'Slug must be 3-50 characters, letters/numbers/hyphens only' })
    }
    // Check if slug is taken
    const { data: existing } = await supabase.from('links').select('id').eq('slug', customSlug).single()
    if (existing) return res.status(409).json({ error: 'This slug is already taken' })
  }

  // Generate unique slug
  let slug = customSlug || generateSlug()
  if (!customSlug) {
    // Make sure it's unique
    let attempts = 0
    while (attempts < 10) {
      const { data: existing } = await supabase.from('links').select('id').eq('slug', slug).single()
      if (!existing) break
      slug = generateSlug()
      attempts++
    }
  }

  // Create the link
  const { data: link, error } = await supabase.from('links').insert({
    user_id: user.id,
    slug,
    original_url: url,
  }).select().single()

  if (error) {
    console.error('Error creating link:', error)
    return res.status(500).json({ error: 'Failed to create link' })
  }

  // Increment monthly count
  await supabase.from('profiles')
    .update({ links_this_month: (profile?.links_this_month || 0) + 1 })
    .eq('id', user.id)

  return res.status(200).json({ slug: link.slug, id: link.id })
}
