'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import MagneticButton from '@/components/MagneticButton'

const NoiseSVG = () => (
  <svg
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.035,
      pointerEvents: 'none',
      zIndex: 1,
      mixBlendMode: 'overlay',
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="noise-login">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise-login)" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid credentials.')
      setLoading(false)
      return
    }

    setTransitioning(true)
    setTimeout(() => router.push('/dashboard'), 600)
  }

  return (
    <div
      data-cursor-dark
      className="dark-bg grid-lines"
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NoiseSVG />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201, 169, 110, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Gold wipe transition overlay */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: transitioning ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--gold)',
          transformOrigin: 'left',
          zIndex: 9000,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 380,
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 72,
              fontWeight: 300,
              letterSpacing: '0.35em',
              color: 'var(--gold)',
              lineHeight: 1,
              paddingLeft: '0.35em',
            }}
          >
            SOLUS
          </h1>
          <div
            style={{
              width: 100,
              height: '0.5px',
              background: 'var(--gold-dim)',
              margin: '20px auto',
              opacity: 0.6,
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 8,
              letterSpacing: '0.5em',
              color: 'var(--gold-dim)',
              textTransform: 'uppercase',
            }}
          >
            Real Estate Partners
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="EMAIL"
              required
              autoComplete="email"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #3a3020',
                color: 'var(--gold)',
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 20,
                padding: '12px 0',
                letterSpacing: '0.05em',
                transition: 'border-color 0.25s',
              }}
              className="dark-input"
              onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--gold)' }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = '#3a3020' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 40 }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="ACCESS"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #3a3020',
                color: 'var(--gold)',
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 20,
                padding: '12px 0',
                letterSpacing: '0.05em',
                transition: 'border-color 0.25s',
              }}
              className="dark-input"
              onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--gold)' }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = '#3a3020' }}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                letterSpacing: '0.2em',
                color: 'rgba(192, 97, 74, 0.9)',
                textTransform: 'uppercase',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {error}
            </motion.p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MagneticButton
              type="submit"
              disabled={loading || transitioning}
              style={{
                width: 300,
                height: 48,
                background: 'var(--gold)',
                color: 'var(--black)',
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.5em',
                textTransform: 'uppercase',
                border: 'none',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Verifying…' : 'Enter'}
            </MagneticButton>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
