'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Contacts', href: '/contacts' },
  { label: 'Presentations', href: '/presentations' },
  { label: 'Market', href: '/market' },
]

export default function SolusNav() {
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 })

  const updateUnderline = useCallback((el: HTMLElement | null) => {
    if (!el || !navRef.current) return
    const navRect = navRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setUnderlineStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1,
    })
  }, [])

  useEffect(() => {
    if (!navRef.current) return
    const activeEl = navRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeEl) {
      updateUnderline(activeEl)
    } else {
      setUnderlineStyle(s => ({ ...s, opacity: 0 }))
    }
  }, [pathname, updateUnderline])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header
      data-cursor-dark
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        background: 'var(--white)',
        borderBottom: '0.5px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 64px',
      }}
    >
      <Link
        href="/dashboard"
        style={{
          fontFamily: 'var(--font-cormorant), var(--font-display)',
          fontSize: 18,
          letterSpacing: '0.3em',
          fontWeight: 300,
          color: 'var(--text-dark)',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        SOLUS
      </Link>

      <div
        ref={navRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          marginLeft: 'auto',
          marginRight: 40,
          position: 'relative',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive}
              className="nav-link"
              style={{
                color: isActive ? 'var(--text-dark)' : undefined,
              }}
            >
              {item.label}
            </Link>
          )
        })}

        {/* Sliding underline */}
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            height: 1,
            background: 'var(--gold)',
            transition: 'all 0.35s var(--ease-expo)',
            pointerEvents: 'none',
            left: underlineStyle.left,
            width: underlineStyle.width,
            opacity: underlineStyle.opacity,
          }}
        />
      </div>

      <button
        onClick={handleSignOut}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(154, 138, 112, 0.8)',
          background: 'none',
          border: 'none',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dark)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(154, 138, 112, 0.8)')}
      >
        Sign Out
      </button>
    </header>
  )
}
