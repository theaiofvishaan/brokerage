'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'

const RENTCAST_KEY = '1a0dd61b5fe74d0fad22d18f72d78683'

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
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 2 }}
    />
  )
}

export default function MarketPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AVMResult | null>(null)
  const [comps, setComps] = useState<Comparable[]>([])
  const [error, setError] = useState<string | null>(null)

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
      const params = new URLSearchParams({ address: address.trim(), propertyType: 'Single Family' })

      const [avmRes, compsRes] = await Promise.all([
        fetch(`https://api.rentcast.io/v1/avm/value?${params}`, {
          headers: { 'X-Api-Key': RENTCAST_KEY },
        }),
        fetch(`https://api.rentcast.io/v1/avm/sale/comparables?${params}&limit=5`, {
          headers: { 'X-Api-Key': RENTCAST_KEY },
        }),
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
    <div
      style={{ minHeight: '100vh', background: '#080806' }}
      className="dark-bg"
    >
      <SolusNav />

      <main style={{ padding: '0 64px', paddingBottom: 80 }}>
        <div style={{ padding: '120px 0 48px' }}>
          <RevealText
            text="Market Intelligence"
            tag="h1"
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 64,
              fontWeight: 300,
              color: '#C9A96E',
              letterSpacing: '0.02em',
              marginBottom: 12,
            }}
            delay={0.1}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: '#8B7248',
            }}
          >
            Property lookup powered by live Florida county data
          </motion.p>
        </div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-end',
            borderBottom: '0.5px solid rgba(201,169,110,0.15)',
            paddingBottom: 32,
            marginBottom: 48,
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter a Florida property address..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid rgba(201,169,110,0.3)',
                color: '#C9A96E',
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 22,
                padding: '12px 0',
                letterSpacing: '0.03em',
                outline: 'none',
                transition: 'border-color 0.25s',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(201,169,110,0.3)')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#C9A96E',
              color: '#080806',
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

        {/* Loading skeletons */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 48 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    border: '0.5px solid rgba(201,169,110,0.15)',
                    padding: '32px 28px',
                  }}>
                    <GoldSkeleton height={10} width="50%" />
                    <div style={{ marginTop: 20 }}>
                      <GoldSkeleton height={40} width="70%" />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '0.5px solid rgba(201,169,110,0.15)', paddingTop: 32 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ padding: '16px 0', borderBottom: '0.5px solid rgba(201,169,110,0.08)' }}>
                    <GoldSkeleton height={12} width="80%" />
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
                color: 'rgba(201,169,110,0.4)',
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 48 }}>
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
                    color: 'rgba(201,169,110,0.5)',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                  }}>
                    Sold Comparables
                  </p>
                  <div style={{ borderTop: '0.5px solid rgba(201,169,110,0.15)' }}>
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
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(201,169,110,0.4)' }}
      style={{
        border: '0.5px solid rgba(201,169,110,0.15)',
        padding: '32px 28px',
        transition: 'border-color 0.3s',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 8,
        letterSpacing: '0.4em',
        color: '#8B7248',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-cormorant), var(--font-display)',
        fontSize: 40,
        fontWeight: 300,
        color: '#C9A96E',
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
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 32,
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '0.5px solid rgba(201,169,110,0.08)',
        background: hovered ? 'rgba(201,169,110,0.03)' : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        color: 'rgba(201,169,110,0.7)',
      }}>
        {comp.formattedAddress}
      </span>
      <span style={{
        fontFamily: 'var(--font-cormorant), var(--font-display)',
        fontSize: 18,
        color: '#C9A96E',
        whiteSpace: 'nowrap',
      }}>
        {fmt$(comp.price)}
      </span>
      {comp.squareFootage && (
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'rgba(201,169,110,0.4)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}>
          {comp.squareFootage.toLocaleString()} sqft
        </span>
      )}
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 10,
        color: 'rgba(201,169,110,0.4)',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {comp.saleDate ? fmtDate(comp.saleDate) : '—'}
      </span>
    </motion.div>
  )
}
