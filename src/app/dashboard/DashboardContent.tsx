'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SolusLayout from '@/components/SolusLayout'
import SplitText from '@/components/SplitText'
import { Spotlight } from '@/components/ui/spotlight'
import { supabase } from '@/lib/supabase'
import { useGsapEntrance } from '@/hooks/useGsapEntrance'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

function formatDateLine() {
  return new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase()
}

const MARQUEE_TEXT =
  'SOLUS · REAL ESTATE PARTNERS · PRIVATE · PRECISION · RESULTS · '

export default function DashboardContent() {
  const [counts, setCounts] = useState<{ contacts: number | null; presentations: number | null; documents: number | null }>({
    contacts: null,
    presentations: null,
    documents: null,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('presentations').select('id', { count: 'exact', head: true }),
      supabase.from('documents').select('id', { count: 'exact', head: true }),
    ]).then(([contactsRes, presentationsRes, documentsRes]) => {
      setCounts({
        contacts: contactsRes.count ?? 0,
        presentations: presentationsRes.count ?? 0,
        documents: documentsRes.count ?? 0,
      })
    })
  }, [])

  const cardsRef = useRef<HTMLElement>(null)
  useGsapEntrance(cardsRef, { stagger: 0.08, delay: 0.4, trigger: true })

  const fmt = (n: number | null) => n === null ? '—' : String(n)

  const CARDS = [
    {
      label: counts.contacts === null ? '— CONTACTS' : `${fmt(counts.contacts)} CONTACTS`,
      title: 'Private network directory',
      href: '/contacts',
    },
    {
      label: 'COASTAL POINTE HOMES',
      title: 'Partnership pitch in preparation',
      href: '/presentations',
    },
    {
      label: counts.presentations === null ? '— PRESENTATIONS' : `${counts.presentations + 1} PRESENTATIONS`,
      title: 'Active pitch portals',
      href: '/presentations',
    },
    {
      label: counts.documents === null ? '— DOCUMENTS' : `${fmt(counts.documents)} DOCUMENTS`,
      title: 'Shared files and resources',
      href: '/documents',
    },
  ]

  return (
    <SolusLayout activePage="dashboard">
      <div style={{ background: 'var(--linen)', minHeight: '100vh', paddingTop: '48px', paddingBottom: '80px' }}>
        {/* Hero */}
        <section
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="rgba(184,150,90,0.08)"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '24px',
              paddingLeft: '40px',
            }}
          >
            {formatDateLine()}
          </motion.p>

          <SplitText
            text={getGreeting()}
            tag="h1"
            delay={0.2}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 5.5vw, 80px)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              color: 'var(--text-dark)',
              marginBottom: '24px',
              paddingLeft: '40px',
            }}
          />

        </section>

        {/* Marquee strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          style={{ marginTop: 0, marginBottom: '32px' }}
        >
          <div
            style={{
              borderTop: '0.5px solid var(--border)',
              borderBottom: '0.5px solid var(--border)',
              overflow: 'hidden',
              padding: '12px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                '--marquee-speed': '30s',
              } as React.CSSProperties}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="marquee-track"
                  aria-hidden={i === 1}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 8,
                    letterSpacing: '0.5em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {MARQUEE_TEXT.repeat(4)}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cards 2x2 grid */}
        <section
          ref={cardsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0,
            marginTop: 0,
          }}
          className="dashboard-grid"
        >
          {CARDS.map((card, i) => (
            <DashboardCard
              key={i}
              label={card.label}
              title={card.title}
              href={card.href}
              borderRight={i % 2 === 0}
              borderBottom={i < 2}
            />
          ))}
        </section>
      </div>
    </SolusLayout>
  )
}

function DashboardCard({
  label,
  title,
  href,
  borderRight,
  borderBottom,
}: {
  label: string
  title: string
  href: string
  borderRight: boolean
  borderBottom: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="gold-wipe"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: borderRight ? '0.5px solid var(--border)' : 'none',
          borderBottom: borderBottom ? '0.5px solid var(--border)' : 'none',
        }}
        className-mobile="p-6"
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--gold)',
          }}
        >
          {label}
        </span>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text-dark)',
            marginTop: 12,
          }}
        >
          {title}
        </h2>

        <motion.span
          animate={{ x: hovered ? 0 : -12, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 18,
            color: 'var(--gold)',
            display: 'inline-block',
            marginTop: 20,
          }}
        >
          &rarr;
        </motion.span>
      </div>
    </Link>
  )
}
