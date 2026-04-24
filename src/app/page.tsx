'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useScramble } from 'use-scramble'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { ref: scrambleRef } = useScramble({
    text: 'SOLUS',
    speed: 0.4,
    tick: 1,
    step: 1,
    scramble: 10,
    playOnMount: true,
  })

  useEffect(() => {
    document.body.classList.add('dark-bg')
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
    const timer = setTimeout(() => setShowForm(true), 600)
    return () => {
      document.body.classList.remove('dark-bg')
      clearTimeout(timer)
    }
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
      className="dark-bg"
      style={{
        minHeight: '100vh',
        background: '#080806',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orb 1 */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
          top: -100,
          left: -200,
          animation: 'float 8s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ambient orb 2 */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
          bottom: -50,
          right: -100,
          animation: 'float 10s ease-in-out infinite alternate-reverse',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        animate={{ opacity: transitioning ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1
            ref={scrambleRef}
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 76,
              fontWeight: 300,
              letterSpacing: '0.4em',
              color: '#C9A96E',
              lineHeight: 1,
              paddingLeft: '0.4em',
            }}
          />
          <div
            style={{
              width: 80,
              height: '0.5px',
              background: '#4A3A20',
              margin: '16px auto',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 8,
              letterSpacing: '0.5em',
              color: '#4A3A20',
              textTransform: 'uppercase',
            }}
          >
            Real Estate Partners
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showForm ? 1 : 0, y: showForm ? 0 : 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 8,
                letterSpacing: '0.35em',
                color: '#4A3A20',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #2a2018',
                color: '#C9A96E',
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 20,
                fontWeight: 300,
                padding: '10px 0',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = '#2a2018')}
            />
          </div>

          <div style={{ marginBottom: 44 }}>
            <label
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 8,
                letterSpacing: '0.35em',
                color: '#4A3A20',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Access
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid #2a2018',
                color: '#C9A96E',
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 20,
                fontWeight: 300,
                padding: '10px 0',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = '#2a2018')}
            />
          </div>

          <button
            type="submit"
            disabled={loading || transitioning}
            style={{
              width: '100%',
              height: 48,
              background: '#C9A96E',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: '#080806',
              transition: 'background 0.4s ease, letter-spacing 0.4s ease, transform 0.1s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#8B7248'
              e.currentTarget.style.letterSpacing = '0.6em'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#C9A96E'
              e.currentTarget.style.letterSpacing = '0.5em'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: 'rgba(201,169,110,0.6)',
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
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-ui)',
          fontSize: 8,
          letterSpacing: '0.3em',
          color: '#2a2018',
          textTransform: 'uppercase',
        }}
      >
        SOLUS &copy; 2025
      </p>
    </div>
  )
}
