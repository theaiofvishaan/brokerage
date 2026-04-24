'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useScramble } from 'use-scramble'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'
import Marquee from '@/components/Marquee'

function getGreetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDateLine() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()
}

const CARDS = [
  { num: '01', title: 'Contacts', desc: 'Your vendor and partner network', href: '/contacts' },
  { num: '02', title: 'Presentations', desc: 'Live builder pitch portals', href: '/presentations' },
  { num: '03', title: 'Documents', desc: 'Shared files and resources', href: '/documents' },
  { num: '04', title: 'Market Intelligence', desc: 'Tampa Bay property data', href: '/market' },
]

export default function DashboardContent() {
  const greetWord = getGreetingWord()
  const { ref: scrambleRef } = useScramble({
    text: greetWord,
    speed: 0.4,
    tick: 1,
    step: 1,
    scramble: 8,
    playOnMount: true,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#EAE4D6' }}>
      <SolusNav />

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingLeft: 64, paddingRight: 64, paddingBottom: 0 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#8a7a60',
            marginBottom: 20,
          }}
        >
          {formatDateLine()}
        </motion.p>

        <RevealText
          text="Good"
          tag="h1"
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 80,
            fontWeight: 300,
            color: '#1A1510',
            lineHeight: 1,
          }}
          delay={0.15}
        />
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 80,
            fontWeight: 300,
            color: '#1A1510',
            lineHeight: 1,
            display: 'flex',
            gap: '0.25em',
          }}
        >
          <span ref={scrambleRef} />
          <span>.</span>
        </h1>
      </section>

      {/* Marquee strip */}
      <div style={{ marginTop: 64 }}>
        <Marquee />
      </div>

      {/* Cards grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: '0 48px',
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
              borderRight: i % 2 === 0 ? '1px solid rgba(180,160,120,0.2)' : 'none',
              borderBottom: i < 2 ? '1px solid rgba(180,160,120,0.2)' : 'none',
            }}
          >
            <DashboardCard
              num={card.num}
              title={card.title}
              desc={card.desc}
              href={card.href}
            />
          </motion.div>
        ))}
      </section>
    </div>
  )
}

function DashboardCard({
  num, title, desc, href,
}: {
  num: string
  title: string
  desc: string
  href: string
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
          background: 'transparent',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(180,160,120,0.5)',
          }}
        >
          {num}
        </span>

        <h2
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 32,
            fontWeight: 400,
            color: '#1A1510',
            marginTop: 16,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: '#8a7a60',
            marginTop: 8,
          }}
        >
          {desc}
        </p>

        <motion.span
          animate={{ x: hovered ? 0 : -12, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 18,
            color: '#C9A96E',
            display: 'inline-block',
            marginTop: 24,
          }}
        >
          &rarr;
        </motion.span>
      </div>
    </Link>
  )
}
