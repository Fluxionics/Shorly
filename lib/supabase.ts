import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for API routes)
export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro' | 'business'
  links_this_month: number
  created_at: string
}

export type Link = {
  id: string
  user_id: string
  slug: string
  original_url: string
  title: string | null
  description: string | null
  password: string | null
  expires_at: string | null
  is_active: boolean
  total_clicks: number
  unique_clicks: number
  created_at: string
}

export type Click = {
  id: string
  link_id: string
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  referrer_domain: string | null
  is_unique: boolean
  clicked_at: string
}
