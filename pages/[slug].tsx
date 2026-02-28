import { useEffect, useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { supabaseAdmin } from '../lib/supabase'

type Props = {
  originalUrl: string
  linkId: string
  isPro: boolean
  error?: string
}

export default function RedirectPage({ originalUrl, linkId, isPro, error }: Props) {
  const [countdown, setCountdown] = useState(5)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (error || !originalUrl) return

    // Track the click
    fetch('/api/links/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId }),
    })

    // For pro links → redirect immediately
    if (isPro) {
      window.location.href = originalUrl
      return
    }

    // For free links → show ad countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setReady(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [originalUrl, isPro, linkId, error])

  const handleRedirect = () => {
    window.location.href = originalUrl
  }

  if (error) {
    return (
      <>
        <Head><title>Link not found — Shorly</title></Head>
        <div style={{
          minHeight: '100vh', background: 'var(--bg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 20,
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔗</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, marginBottom: 12 }}>Link not found</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            This link may have expired or been deleted.
          </p>
          <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Create your own short links →
          </a>
        </div>
      </>
    )
  }

  if (isPro) {
    return (
      <>
        <Head><title>Redirecting... — Shorly</title></Head>
        <div style={{
          minHeight: '100vh', background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Redirecting...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>You're being redirected — Shorly</title></Head>
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative',
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#3DFFA0" />
            <path d="M8 16C8 11.582 11.582 8 16 8s8 3.582 8 8" stroke="#050b12" strokeWidth="3" strokeLinecap="round"/>
            <path d="M13 20l3-8 3 8" stroke="#050b12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16" cy="22" r="2" fill="#050b12"/>
          </svg>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Shorly</span>
        </a>

        <div className="card" style={{ maxWidth: 480, width: '100%', padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>You are being redirected to:</p>
          <p style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'JetBrains Mono', marginBottom: 24, wordBreak: 'break-all' }}>
            {originalUrl.length > 60 ? originalUrl.substring(0, 60) + '...' : originalUrl}
          </p>

          {/* Ad placeholder */}
          <div className="ad-container" style={{ marginBottom: 28 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Advertisement
            </p>
            {/* Replace this div with actual Google AdSense code */}
            <div style={{
              height: 120, background: 'rgba(255,255,255,0.02)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              {/* 
                INSERT GOOGLE ADSENSE CODE HERE:
                <ins className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="XXXXXXXXXX"
                  data-ad-format="auto"
                  data-full-width-responsive="true" />
              */}
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Ad space — 320x100</span>
            </div>
          </div>

          {!ready ? (
            <div>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: 'rgba(61,255,160,0.08)', border: '3px solid rgba(61,255,160,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(61,255,160,0.15)',
              }}>
                <span className="stat-number" style={{ fontSize: 28, color: 'var(--accent)' }}>{countdown}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleRedirect} style={{ width: '100%', fontSize: 16 }}>
              Continue to destination →
            </button>
          )}
        </div>

        <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
          Powered by <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Shorly</a> ·{' '}
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Create your own free links</a>
        </p>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }
  const supabase = supabaseAdmin()

  const { data: link } = await supabase
    .from('links')
    .select('*, profiles(plan)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!link) {
    return { props: { error: 'not_found', originalUrl: '', linkId: '', isPro: false } }
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { props: { error: 'expired', originalUrl: '', linkId: '', isPro: false } }
  }

  const isPro = (link as any).profiles?.plan !== 'free'

  return {
    props: {
      originalUrl: link.original_url,
      linkId: link.id,
      isPro,
    }
  }
}
