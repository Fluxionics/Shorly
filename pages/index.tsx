import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { isValidUrl, getShortUrl } from '../lib/utils'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleShorten = async () => {
    setError('')
    if (!url) return setError('Enter a URL first')
    if (!isValidUrl(url)) return setError('Please enter a valid URL (include https://)')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth?redirect=shorten&url=' + encodeURIComponent(url))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShortUrl(getShortUrl(data.slug))
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head><title>Shorly — Smart Link Shortener</title></Head>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Gradient orbs */}
        <div className="orb" style={{
          width: 600, height: 600, top: -200, left: -100,
          background: 'radial-gradient(circle, rgba(61,255,160,0.08) 0%, transparent 70%)'
        }} />
        <div className="orb" style={{
          width: 400, height: 400, top: 100, right: -100,
          background: 'radial-gradient(circle, rgba(99,148,255,0.06) 0%, transparent 70%)'
        }} />

        {/* Grid background */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

        {/* Navbar */}
        <nav style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 40px', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3DFFA0" />
              <path d="M8 16C8 11.582 11.582 8 16 8s8 3.582 8 8" stroke="#050b12" strokeWidth="3" strokeLinecap="round"/>
              <path d="M13 20l3-8 3 8" stroke="#050b12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="22" r="2" fill="#050b12"/>
            </svg>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Shorly
            </span>
            <span style={{ fontSize: 10, background: 'var(--accent)', color: '#050b12', padding: '2px 8px', borderRadius: 100, fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.1em' }}>
              BETA
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as any).style.color = 'var(--text)'}
              onMouseLeave={e => (e.target as any).style.color = 'var(--text-muted)'}>
              Pricing
            </Link>
            <Link href="/auth" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
              onMouseEnter={e => (e.target as any).style.color = 'var(--text)'}
              onMouseLeave={e => (e.target as any).style.color = 'var(--text-muted)'}>
              Sign in
            </Link>
            <Link href="/auth?mode=signup">
              <button className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
                Get started free
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '100px 20px 60px',
        }}>
          <div className="badge badge-green" style={{ marginBottom: 24 }}>
            <span>✦</span> Free to start — no credit card needed
          </div>

          <h1 style={{
            fontFamily: 'Syne', fontWeight: 800,
            fontSize: 'clamp(40px, 7vw, 86px)',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            maxWidth: 800, marginBottom: 20,
            background: 'linear-gradient(135deg, #e8f4ff 0%, #3dffa0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Shorten links.<br/>Track everything.
          </h1>

          <p style={{
            color: 'var(--text-muted)', fontSize: 18, maxWidth: 520,
            lineHeight: 1.7, marginBottom: 48,
          }}>
            Create short, powerful links with deep analytics. Know who clicks, from where, and on what device — in real time.
          </p>

          {/* Shortener box */}
          <div style={{
            width: '100%', maxWidth: 620,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: 8,
            display: 'flex', gap: 8,
            boxShadow: '0 0 40px rgba(0,0,0,0.4)',
          }}>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', fontSize: 15, flex: 1 }}
              placeholder="Paste your long URL here..."
              value={url}
              onChange={e => { setUrl(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleShorten()}
            />
            <button
              className="btn-primary"
              onClick={handleShorten}
              disabled={loading}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Shortening...' : 'Shorten →'}
            </button>
          </div>

          {error && (
            <p style={{ color: 'var(--red)', marginTop: 12, fontSize: 14 }}>{error}</p>
          )}

          {shortUrl && (
            <div className="slide-in" style={{
              marginTop: 16, padding: '14px 20px',
              background: 'rgba(61,255,160,0.05)',
              border: '1px solid rgba(61,255,160,0.2)',
              borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16,
              width: '100%', maxWidth: 620,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontSize: 15, flex: 1 }}>
                {shortUrl}
              </span>
              <button
                className="btn-primary"
                onClick={handleCopy}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                View stats →
              </Link>
            </div>
          )}

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: 48, marginTop: 64,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {[
              { label: 'Links created', value: '12K+' },
              { label: 'Clicks tracked', value: '2.4M+' },
              { label: 'Countries', value: '190+' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div className="stat-number" style={{ fontSize: 32, color: 'var(--accent)' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 40px', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Built for growth
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
                Everything you need to shorten, manage, and analyze your links in one place.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {features.map((f, i) => (
                <div key={i} className="card" style={{ padding: 28 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(61,255,160,0.1)', border: '1px solid rgba(61,255,160,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: 18,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                    {f.desc}
                  </p>
                  {f.pro && <span className="badge badge-yellow" style={{ marginTop: 14, fontSize: 10 }}>PRO</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ padding: '80px 40px', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Simple pricing
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 17 }}>
                Start free. Upgrade when you need more power.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {plans.map((plan, i) => (
                <div key={i} className="card" style={{
                  padding: 32,
                  border: plan.featured ? '1px solid rgba(61,255,160,0.4)' : undefined,
                  background: plan.featured ? 'linear-gradient(135deg, rgba(61,255,160,0.05), var(--bg-card))' : undefined,
                  position: 'relative',
                  boxShadow: plan.featured ? '0 0 40px rgba(61,255,160,0.1)' : undefined,
                }}>
                  {plan.featured && (
                    <div className="badge badge-green" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{plan.name}</h3>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 42 }}>{plan.price}</span>
                    {plan.price !== 'Free' && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>}
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth?mode=signup">
                    <button className={plan.featured ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%' }}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '32px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap', gap: 16,
          position: 'relative', zIndex: 5,
        }}>
          <span>© 2024 Shorly by <strong style={{ color: 'var(--accent)' }}>Fluxionics</strong></span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Terms', 'Privacy', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}

const features = [
  { icon: '⚡', title: 'Instant shortening', desc: 'Create short links in milliseconds. No fuss, no waiting.' },
  { icon: '📊', title: 'Deep analytics', desc: 'See clicks by country, device, browser, referrer and more — all in real time.', pro: true },
  { icon: '🔐', title: 'Password protection', desc: 'Lock your links behind a password for private sharing.', pro: true },
  { icon: '⏱️', title: 'Link expiration', desc: 'Set links to expire automatically by date or click count.', pro: true },
  { icon: '📱', title: 'QR codes', desc: 'Every link gets a free QR code ready to download and use.' },
  { icon: '🎯', title: 'Custom slugs', desc: 'Create memorable links like yoursite.com/launch instead of random chars.', pro: true },
]

const plans = [
  {
    name: 'Free',
    price: 'Free',
    featured: false,
    cta: 'Get started',
    features: ['50 links/month', 'Basic click stats (7 days)', 'QR codes', 'Ad-supported redirects'],
  },
  {
    name: 'Pro',
    price: '$7',
    featured: true,
    cta: 'Start Pro',
    features: ['Unlimited links', '1 year analytics history', 'Password protection', 'Link expiration', 'Custom slugs', 'No ads'],
  },
  {
    name: 'Business',
    price: '$24',
    featured: false,
    cta: 'Go Business',
    features: ['Everything in Pro', 'API access', 'Team members (5)', 'A/B testing links', 'Priority support', 'Export CSV data'],
  },
]
