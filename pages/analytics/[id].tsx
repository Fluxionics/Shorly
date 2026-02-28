import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase, type Link as LinkType, type Click } from '../../lib/supabase'
import { getShortUrl } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3DFFA0', '#63a4ff', '#ffd23f', '#ff4d6a', '#a78bfa', '#fb923c']

export default function AnalyticsPage() {
  const router = useRouter()
  const { id } = router.query
  const [link, setLink] = useState<LinkType | null>(null)
  const [clicks, setClicks] = useState<Click[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'geo'>('overview')
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      setIsPro(profileData?.plan !== 'free')

      const { data: linkData } = await supabase.from('links').select('*').eq('id', id).single()
      if (!linkData || linkData.user_id !== user.id) { router.push('/dashboard'); return }
      setLink(linkData)

      const daysBack = profileData?.plan === 'free' ? 7 : 365
      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const { data: clicksData } = await supabase
        .from('clicks')
        .select('*')
        .eq('link_id', id)
        .gte('clicked_at', since.toISOString())
        .order('clicked_at', { ascending: true })

      setClicks(clicksData || [])
      setLoading(false)
    }
    fetchData()
  }, [id, router])

  // Process data for charts
  const clicksByDay = (() => {
    const map: Record<string, number> = {}
    clicks.forEach(c => {
      const day = new Date(c.clicked_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      map[day] = (map[day] || 0) + 1
    })
    return Object.entries(map).map(([date, count]) => ({ date, count })).slice(-14)
  })()

  const deviceData = (() => {
    const map: Record<string, number> = {}
    clicks.forEach(c => { const d = c.device || 'unknown'; map[d] = (map[d] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  })()

  const countryData = (() => {
    const map: Record<string, number> = {}
    clicks.forEach(c => { const d = c.country || 'Unknown'; map[d] = (map[d] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
  })()

  const referrerData = (() => {
    const map: Record<string, number> = {}
    clicks.forEach(c => { const d = c.referrer_domain || 'Direct'; map[d] = (map[d] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }))
  })()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <Head><title>Analytics — Shorly</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid var(--border)',
          background: 'rgba(5,11,18,0.9)', backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 14 }}>
            ← Back to dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3DFFA0" />
              <path d="M8 16C8 11.582 11.582 8 16 8s8 3.582 8 8" stroke="#050b12" strokeWidth="3" strokeLinecap="round"/>
              <path d="M13 20l3-8 3 8" stroke="#050b12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="22" r="2" fill="#050b12"/>
            </svg>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>Shorly</span>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
          
          {/* Link info */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
                  {link && getShortUrl(link.slug)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 500 }}>{link?.original_url}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-number" style={{ fontSize: 28, color: 'var(--accent)' }}>{link?.total_clicks}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Total clicks</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-number" style={{ fontSize: 28 }}>{link?.unique_clicks}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unique clicks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Free plan notice */}
          {!isPro && (
            <div style={{
              padding: '14px 20px', borderRadius: 12, marginBottom: 24,
              background: 'rgba(255,210,63,0.08)', border: '1px solid rgba(255,210,63,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: 'var(--yellow)', fontSize: 14 }}>
                ⚡ You're seeing the last 7 days. <strong>Upgrade to Pro</strong> for 1 year of history + all analytics.
              </span>
              <Link href="/#pricing">
                <button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Upgrade</button>
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {(['overview', 'devices', 'geo'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 20px', fontSize: 14, fontFamily: 'Syne', fontWeight: 600,
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s', textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Clicks over time</h3>
                {clicksByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={clicksByDay}>
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                      <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No clicks yet
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Top referrers</h3>
                {referrerData.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 140 }}>{r.name}</span>
                    <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 4, width: `${(r.value / (referrerData[0]?.value || 1)) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{r.value}</span>
                  </div>
                ))}
                {referrerData.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No referrer data yet.</p>}
              </div>
            </div>
          )}

          {/* Devices tab */}
          {activeTab === 'devices' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Device types</h3>
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {deviceData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No device data yet.</p>}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Breakdown</h3>
                {deviceData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geo tab */}
          {activeTab === 'geo' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                Clicks by country
                {!isPro && <span className="badge badge-yellow" style={{ marginLeft: 10, fontSize: 10 }}>PRO</span>}
              </h3>
              {!isPro ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Geo analytics available on Pro plan</p>
                  <Link href="/#pricing"><button className="btn-primary">Upgrade to Pro</button></Link>
                </div>
              ) : countryData.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 120 }}>{c.name}</span>
                  <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: COLORS[i % COLORS.length], borderRadius: 4, width: `${(c.value / (countryData[0]?.value || 1)) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 600, minWidth: 30 }}>{c.value}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
