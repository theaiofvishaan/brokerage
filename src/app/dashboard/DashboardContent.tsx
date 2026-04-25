'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SolusLayout from '@/components/SolusLayout'
import { TextEffect } from '@/components/ui/text-effect'
import { Spotlight } from '@/components/ui/spotlight'

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

const CARDS = [
  {
    label: '743 CONTACTS',
    title: 'Private network directory',
    href: '/contacts',
  },
  {
    label: 'COASTAL POINTE HOMES',
    title: 'Partnership pitch in preparation',
    href: '/presentations',
  },
  {
    label: 'PRESENTATIONS',
    title: 'Active pitch portals',
    href: '/presentations',
  },
  {
    label: 'DOCUMENTS',
    title: 'Shared files and resources',
    href: '/documents',
  },
]

export default function DashboardContent() {
  return (
    <SolusLayout activePage="dashboard">
      <div style={{ background: 'var(--linen)', minHeight: '100vh' }}>
        {/* Hero */}
        <section
          style={{ position: 'relative', overflow: 'hidden' }}
          className="pt-20 md:pt-20 px-6 md:px-16"
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
              marginBottom: 20,
            }}
          >
            {formatDateLine()}
          </motion.p>

          <TextEffect
            preset="blur"
            per="word"
            className="dashboard-greeting"
            as="h1"
          >
            {getGreeting()}
          </TextEffect>
          <style>{`
            .dashboard-greeting {
              font-family: var(--font-display);
              font-size: 72px;
              font-weight: 300;
              color: var(--text-dark);
              line-height: 1;
            }
            @media (max-width: 767px) {
              .dashboard-greeting { font-size: 40px; }
            }
          `}</style>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              color: 'var(--text-muted)',
              marginTop: 12,
            }}
          >
            Your executive summary is ready.
          </motion.p>
        </section>

        {/* Marquee strip */}
        <div className="mt-12 md:mt-12">
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
        </div>

        {/* Cards 2x2 grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0,
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
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: borderRight ? '1px solid var(--border)' : 'none',
          borderBottom: borderBottom ? '1px solid var(--border)' : 'none',
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
