'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'
import Marquee from '@/components/Marquee'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

function formatDateLine() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    const raf = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, duration])
  return count
}

const CARDS = [
  {
    num: '01',
    title: 'Contacts',
    desc: 'Your vendor and partner network',
    href: '/contacts',
  },
  {
    num: '02',
    title: 'Presentations',
    desc: 'Live builder pitch portals',
    href: '/presentations',
  },
  {
    num: '03',
    title: 'Market Intelligence',
    desc: 'Tampa Bay property data',
    href: '/market',
  },
  {
    num: '04',
    title: 'Documents',
    desc: 'Shared files and resources',
    href: '/documents',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [name, setName] = useState('Vishaan')
  const [contactCount, setContactCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const animatedCount = useCountUp(loaded ? contactCount : 0, 1400)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      if (user.email) {
        const raw = user.email.split('@')[0].split('.')[0]
        setName(raw.charAt(0).toUpperCase() + raw.slice(1))
      }
    })

    supabase.from('contacts').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setContactCount(count ?? 0)
      setLoaded(true)
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--linen)' }}>
      <SolusNav />

      {/* Hero */}
      <section style={{ padding: '80px 64px 56px' }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(154, 138, 112, 0.8)',
            marginBottom: 20,
          }}
        >
          {formatDateLine()}
        </motion.p>

        <RevealText
          text={getGreeting()}
          tag="h1"
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 80,
            fontWeight: 300,
            color: 'var(--text-dark)',
            lineHeight: 1,
            marginBottom: 0,
          }}
          delay={0.15}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 80,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--gold)',
              lineHeight: 1.05,
              marginTop: 4,
            }}
          >
            {name}.
          </h1>
        </motion.div>
      </section>

      {/* Marquee strip */}
      <Marquee />

      {/* Cards grid — 2×2 desktop, 1 col mobile */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          borderTop: '0.5px solid rgba(180, 160, 120, 0.2)',
        }}
        className="dashboard-grid"
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={card.num}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRight: i % 2 === 0 ? '0.5px solid rgba(180, 160, 120, 0.2)' : 'none',
              borderBottom: i < 2 ? '0.5px solid rgba(180, 160, 120, 0.2)' : 'none',
            }}
          >
            <DashboardCard
              num={card.num}
              title={card.title}
              desc={card.desc}
              href={card.href}
              stat={card.num === '01' ? animatedCount : undefined}
            />
          </motion.div>
        ))}
      </section>
    </div>
  )
}

function DashboardCard({
  num, title, desc, href, stat,
}: {
  num: string
  title: string
  desc: string
  href: string
  stat?: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="gold-wipe"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: '40px 36px',
          background: hovered ? 'rgba(234, 228, 214, 0.5)' : 'transparent',
          transition: 'background 0.3s ease',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.4em',
              color: 'var(--gold-dim)',
              textTransform: 'uppercase',
            }}
          >
            {num}
          </span>
          <motion.span
            animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 16,
              color: 'var(--gold)',
            }}
          >
            →
          </motion.span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 32,
            fontWeight: 300,
            color: 'var(--text-dark)',
            letterSpacing: '0.02em',
            marginBottom: 12,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: 'rgba(154, 138, 112, 0.9)',
            lineHeight: 1.6,
            marginBottom: 'auto',
          }}
        >
          {desc}
        </p>

        {stat !== undefined && (
          <div style={{ marginTop: 32 }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 48,
                fontWeight: 300,
                color: 'var(--gold)',
                lineHeight: 1,
              }}
            >
              {stat}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.4em',
                color: 'var(--gold-dim)',
                textTransform: 'uppercase',
                marginLeft: 12,
              }}
            >
              contacts
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
