import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase, type Link as LinkType, type Profile } from '../lib/supabase'
import { isValidUrl, getShortUrl, generateSlug } from '../lib/utils'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'clicks'>('newest')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const [{ data: profileData }, { data: linksData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    setProfile(profileData)
    setLinks(linksData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    setError('')
    if (!url) return setError('Enter a URL')
    if (!isValidUrl(url)) return setError('Enter a valid URL (include https://)')

    setCreating(true)
    try {
      const res = await fetch('/api/links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customSlug: customSlug || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUrl('')
      setCustomSlug('')
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = (link: LinkType) => {
    navigator.clipboard.writeText(getShortUrl(link.slug))
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    await supabase.from('links').delete().eq('id', id)
    setLinks(links.filter(l => l.id !== id))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredLinks = links
    .filter(l => !searchQuery || l.original_url.includes(searchQuery) || l.slug.includes(searchQuery) || l.title?.includes(searchQuery))
    .sort((a, b) => sortBy === 'clicks' ? b.total_clicks - a.total_clicks : 0)

  const totalClicks = links.reduce((sum, l) => sum + l.total_clicks, 0)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Dashboard — Shorly</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(5,11,18,0.9)',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3DFFA0" />
              <path d="M8 16C8 11.582 11.582 8 16 8s8 3.582 8 8" stroke="#050b12" strokeWidth="3" strokeLinecap="round"/>
              <path d="M13 20l3-8 3 8" stroke="#050b12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="22" r="2" fill="#050b12"/>
            </svg>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Shorly</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {profile?.plan === 'free' && (
              <Link href="#pricing">
                <span className="badge badge-yellow">⚡ Upgrade to Pro</span>
              </Link>
            )}
            {profile?.plan !== 'free' && (
              <span className="badge badge-green">{profile?.plan?.toUpperCase()}</span>
            )}
            <button onClick={handleSignOut} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Sign out
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          
          {/* Greeting */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, marginBottom: 4 }}>
              Hey, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Here's an overview of your links and performance.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total links', value: links.length, icon: '🔗' },
              { label: 'Total clicks', value: totalClicks.toLocaleString(), icon: '👆' },
              { label: 'Active links', value: links.filter(l => l.is_active).length, icon: '✅' },
              { label: 'Plan', value: profile?.plan?.toUpperCase() || 'FREE', icon: '⭐' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </div>
                  <div className="stat-number" style={{ fontSize: 24, color: 'var(--text)' }}>{stat.value}</div>
                </div>
                <span style={{ fontSize: 28, opacity: 0.6 }}>{stat.icon}</span>
              </div>
            ))}
          </div>

          {/* Create link */}
          <div className="card" style={{ padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Create short link</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="input"
                style={{ flex: '1 1 300px' }}
                placeholder="https://your-long-url.com/goes/here"
                value={url}
                onChange={e => { setUrl(e.target.value); setError('') }}
              />
              <input
                className="input"
                style={{ flex: '0 1 180px' }}
                placeholder={profile?.plan === 'free' ? 'Custom slug (Pro)' : 'Custom slug (optional)'}
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                disabled={profile?.plan === 'free'}
              />
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={creating}
                style={{ flexShrink: 0, opacity: creating ? 0.7 : 1 }}
              >
                {creating ? 'Creating...' : 'Create link'}
              </button>
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</p>}
            {profile?.plan === 'free' && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 10 }}>
                {profile.links_this_month}/50 links this month ·{' '}
                <Link href="#pricing" style={{ color: 'var(--accent)' }}>Upgrade for unlimited</Link>
              </p>
            )}
          </div>

          {/* Links list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12,
            }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
                Your links <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}>({links.length})</span>
              </h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="input"
                  style={{ width: 200, padding: '8px 12px', fontSize: 13 }}
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                >
                  <option value="newest">Newest first</option>
                  <option value="clicks">Most clicks</option>
                </select>
              </div>
            </div>

            {filteredLinks.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  {searchQuery ? 'No links match your search' : "You haven't created any links yet. Start above!"}
                </p>
              </div>
            ) : (
              filteredLinks.map((link, i) => (
                <div
                  key={link.id}
                  className="slide-in"
                  style={{
                    padding: '16px 24px',
                    borderBottom: i < filteredLinks.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontSize: 14, fontWeight: 500 }}>
                        {getShortUrl(link.slug)}
                      </span>
                      {!link.is_active && <span className="badge badge-red" style={{ fontSize: 10 }}>INACTIVE</span>}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
                      → {link.original_url}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                      {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Click stats */}
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div className="stat-number" style={{ fontSize: 20, color: 'var(--text)' }}>{link.total_clicks}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>clicks</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div className="stat-number" style={{ fontSize: 20, color: 'var(--text)' }}>{link.unique_clicks}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>unique</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleCopy(link)}
                      className="btn-secondary"
                      style={{ padding: '7px 14px', fontSize: 12 }}
                    >
                      {copiedId === link.id ? '✓ Copied' : 'Copy'}
                    </button>
                    <Link href={`/analytics/${link.id}`}>
                      <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 12 }}>
                        Stats
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(link.id)}
                      style={{
                        background: 'none', border: '1px solid transparent', borderRadius: 8,
                        color: 'var(--text-muted)', cursor: 'pointer', padding: '7px 10px', fontSize: 12,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { (e.target as any).style.color = 'var(--red)'; (e.target as any).style.borderColor = 'rgba(255,77,106,0.3)' }}
                      onMouseLeave={e => { (e.target as any).style.color = 'var(--text-muted)'; (e.target as any).style.borderColor = 'transparent' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  )
}
