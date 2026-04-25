'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'
import SolusLayout from '@/components/SolusLayout'
import SplitText from '@/components/SplitText'


interface AVMResult {
  price: number
  priceRangeLow: number
  priceRangeHigh: number
  rent: number
  rentRangeLow: number
  rentRangeHigh: number
  latitude: number
  longitude: number
}

interface Comparable {
  id: string
  formattedAddress: string
  price: number
  saleDate: string
  squareFootage: number
  bedrooms: number
  bathrooms: number
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function GoldSkeleton({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 2 }} />
}

export default function MarketContent() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AVMResult | null>(null)
  const [comps, setComps] = useState<Comparable[]>([])
  const [error, setError] = useState<string | null>(null)
  const statGridRef = useRef<HTMLDivElement>(null)

  const animateStatCards = useCallback(() => {
    if (!statGridRef.current) return
    gsap.from(statGridRef.current.children, {
      y: 32,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'expo.out',
    })
  }, [])

  useEffect(() => {
    if (result && !loading) animateStatCards()
  }, [result, loading, animateStatCards])

  useEffect(() => {
    document.body.classList.add('dark-bg')
    return () => { document.body.classList.remove('dark-bg') }
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim() || loading) return
    setLoading(true)
    setResult(null)
    setComps([])
    setError(null)

    try {
      const [avmRes, compsRes] = await Promise.all([
        fetch(`/api/market?${new URLSearchParams({ address: address.trim(), type: 'value' })}`),
        fetch(`/api/market?${new URLSearchParams({ address: address.trim(), type: 'comparables' })}`),
      ])

      if (!avmRes.ok) {
        setError('No data found for this address.')
        setLoading(false)
        return
      }

      const avmData = await avmRes.json()
      setResult(avmData)

      if (compsRes.ok) {
        const compsData = await compsRes.json()
        setComps(compsData.comparables ?? [])
      }
    } catch {
      setError('No data found for this address.')
    }

    setLoading(false)
  }

  const confidenceScore = result
    ? Math.round(100 - Math.abs(result.priceRangeHigh - result.priceRangeLow) / result.price * 50)
    : 0

  return (
    <SolusLayout activePage="market">
      <div className="page-content" style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
        <main className="px-6 md:px-12 pb-20">
          <div className="pt-16 md:pt-16 pb-8">
            <SplitText
              text="Market Intelligence"
              tag="h1"
              delay={0}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 6vw, 60px)',
                fontWeight: 300,
                color: 'var(--gold)',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                letterSpacing: '0.15em',
                color: 'var(--gold-dim)',
                marginTop: 8,
              }}
            >
              Property lookup powered by live Florida county data
            </p>
          </div>

          {/* Search */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'flex-end',
              borderBottom: '0.5px solid rgba(184,150,90,0.15)',
              paddingBottom: 32,
              marginBottom: 48,
            }}
          >
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter a Florida property address..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid rgba(184,150,90,0.3)',
                  color: 'var(--gold)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  padding: '12px 0',
                  letterSpacing: '0.03em',
                  outline: 'none',
                  transition: 'border-color 0.25s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(184,150,90,0.3)')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-hover
              style={{
                background: 'var(--gold)',
                color: 'var(--obsidian)',
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                border: 'none',
                padding: '14px 32px',
                flexShrink: 0,
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              Search
            </button>
          </motion.form>

          {/* Empty state */}
          {!result && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--gold-dim)',
                maxWidth: 400,
                margin: '0 auto',
                lineHeight: 1.6,
              }}>
                Enter a Florida property address to retrieve AVM, rent estimate, and sold comparables.
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="market-stat-grid" style={{ display: 'grid', gap: 24, marginBottom: 48 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ border: '0.5px solid rgba(184,150,90,0.15)', padding: '32px 28px' }}>
                      <GoldSkeleton height={10} width="50%" />
                      <div style={{ marginTop: 20 }}>
                        <GoldSkeleton height={40} width="70%" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && !loading && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  color: 'rgba(184,150,90,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div ref={statGridRef} className="market-stat-grid" style={{ display: 'grid', gap: 24, marginBottom: 48 }}>
                  <StatCard label="Estimated Value" value={fmt$(result.price)} />
                  <StatCard label="Rent Estimate" value={`${fmt$(result.rent)}/mo`} />
                  <StatCard label="Confidence Score" value={`${confidenceScore}%`} />
                </div>

                {comps.length > 0 && (
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 9,
                      letterSpacing: '0.4em',
                      color: 'rgba(184,150,90,0.5)',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                    }}>
                      Sold Comparables
                    </p>
                    <div style={{ borderTop: '0.5px solid rgba(184,150,90,0.15)' }}>
                      {comps.map((comp, i) => (
                        <CompRow key={comp.id ?? i} comp={comp} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </SolusLayout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(184,150,90,0.4)' }}
      style={{
        border: '0.5px solid rgba(184,150,90,0.15)',
        padding: '32px 28px',
        transition: 'border-color 0.3s',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 8,
        letterSpacing: '0.4em',
        color: 'var(--gold-dim)',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 40,
        fontWeight: 300,
        color: 'var(--gold)',
        lineHeight: 1,
      }}>
        {value}
      </p>
    </motion.div>
  )
}

function CompRow({ comp, index }: { comp: Comparable; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="comp-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 32,
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '0.5px solid rgba(184,150,90,0.08)',
        background: hovered ? 'rgba(184,150,90,0.03)' : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(184,150,90,0.7)' }}>
        {comp.formattedAddress}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
        {fmt$(comp.price)}
      </span>
      {comp.squareFootage && (
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(184,150,90,0.4)',
          letterSpacing: '0.1em', whiteSpace: 'nowrap',
        }}>
          {comp.squareFootage.toLocaleString()} sqft
        </span>
      )}
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(184,150,90,0.4)',
        letterSpacing: '0.1em', whiteSpace: 'nowrap',
      }}>
        {comp.saleDate ? fmtDate(comp.saleDate) : '—'}
      </span>
    </motion.div>
  )
}
