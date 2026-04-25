'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useScramble } from 'use-scramble'
import { supabase } from '@/lib/supabase'
import { BackgroundBeams } from '@/components/ui/background-beams'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const { ref: scrambleRef } = useScramble({
    text: 'SOLUS',
    speed: 0.4,
    tick: 1,
    step: 1,
    scramble: 8,
    seed: 2,
  })

  useEffect(() => {
    document.body.classList.add('dark-bg')
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
    return () => { document.body.classList.remove('dark-bg') }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

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
      style={{
        minHeight: '100vh',
        background: 'var(--obsidian)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundBeams className="absolute inset-0 z-0" />

      <motion.div
        animate={{ opacity: transitioning ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 360,
          maxWidth: 'calc(100% - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span
            ref={scrambleRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 72,
              fontWeight: 300,
              letterSpacing: '0.4em',
              color: 'var(--gold)',
              lineHeight: 1,
              paddingLeft: '0.4em',
              display: 'block',
            }}
          />
          <div
            style={{
              width: 60,
              height: '0.5px',
              background: 'var(--gold-muted)',
              opacity: 0.6,
              margin: '14px auto',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 8,
              letterSpacing: '0.5em',
              color: 'var(--gold-muted)',
              textTransform: 'uppercase',
            }}
          >
            PRIVATE ACCESS
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 8,
                letterSpacing: '0.35em',
                color: 'var(--gold-muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #2a2018',
                color: 'var(--gold)',
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 300,
                padding: '10px 0',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = '#2a2018')}
            />
          </div>

          <div style={{ marginBottom: 36 }}>
            <label
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 8,
                letterSpacing: '0.35em',
                color: 'var(--gold-muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              PASSPHRASE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #2a2018',
                color: 'var(--gold)',
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 300,
                padding: '10px 0',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = '#2a2018')}
            />
          </div>

          <button
            type="submit"
            disabled={loading || transitioning}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--gold)',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'var(--obsidian)',
              transition: 'opacity 0.3s, letter-spacing 0.3s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
              e.currentTarget.style.letterSpacing = '0.6em'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = loading ? '0.7' : '1'
              e.currentTarget.style.letterSpacing = '0.5em'
            }}
            data-hover
          >
            {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
          </button>

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.3em',
              color: 'var(--gold-muted)',
              textAlign: 'center',
              marginTop: 16,
            }}
            data-hover
          >
            REQUEST ACCESS
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: 'rgba(184,150,90,0.5)',
                textAlign: 'center',
                marginTop: 16,
              }}
            >
              {error}
            </motion.p>
          )}
        </motion.form>
      </motion.div>

      {/* Footer */}
      <p
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-ui)',
          fontSize: 7,
          letterSpacing: '0.3em',
          color: 'var(--gold-muted)',
          opacity: 0.4,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        SECURE CONNECTION ESTABLISHED
      </p>
    </div>
  )
}
