'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Contacts', href: '/contacts' },
  { label: 'Presentations', href: '/presentations' },
  { label: 'Documents', href: '/documents' },
  { label: 'Market Intelligence', href: '/market' },
]

export default function SolusNav() {
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 })

  const isDark = pathname.startsWith('/market')

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

  const linkColor = isDark ? 'rgba(201,169,110,0.5)' : 'rgba(26,21,16,0.5)'
  const activeLinkColor = isDark ? 'var(--gold)' : '#1A1510'
  const logoColor = isDark ? 'var(--gold)' : '#1A1510'

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        background: isDark ? 'rgba(8,8,6,0.95)' : 'rgba(234,228,214,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '0.5px solid rgba(201,169,110,0.1)' : '0.5px solid rgba(180,160,120,0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 64px',
      }}
    >
      <Link
        href="/dashboard"
        style={{
          fontFamily: 'var(--font-cormorant), var(--font-display)',
          fontSize: 20,
          letterSpacing: '0.3em',
          fontWeight: 400,
          color: logoColor,
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
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: isActive ? activeLinkColor : linkColor,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = activeLinkColor)}
              onMouseLeave={e => {
                if (!e.currentTarget.dataset.active || e.currentTarget.dataset.active !== 'true') {
                  e.currentTarget.style.color = linkColor
                }
              }}
            >
              {item.label}
            </Link>
          )
        })}

        <div
          style={{
            position: 'absolute',
            bottom: -1,
            height: '0.5px',
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
          color: linkColor,
          background: 'none',
          border: 'none',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = activeLinkColor)}
        onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
      >
        Sign Out
      </button>
    </header>
  )
}
