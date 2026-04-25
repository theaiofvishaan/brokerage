'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Presentation,
  Users,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react'
import MagneticButton from './MagneticButton'

const NAV_ITEMS = [
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { label: 'PRESENTATIONS', href: '/presentations', icon: Presentation },
  { label: 'CONTACTS', href: '/contacts', icon: Users },
  { label: 'DOCUMENTS', href: '/documents', icon: FileText },
  { label: 'MARKET', href: '/market', icon: BarChart3 },
]

interface SolusLayoutProps {
  children: React.ReactNode
  activePage: string
}

export default function SolusLayout({ children, activePage }: SolusLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 220,
          height: '100vh',
          background: 'var(--sidebar)',
          borderRight: '0.5px solid var(--border)',
          zIndex: 50,
        }}
        className="hidden md:flex md:flex-col"
      >
        {/* Logo */}
        <div style={{ padding: '32px 24px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                letterSpacing: '0.3em',
                color: 'var(--gold)',
                fontWeight: 400,
              }}
            >
              SOLUS
            </div>
          </Link>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 8,
              letterSpacing: '0.4em',
              color: 'var(--gold-muted)',
              marginTop: 4,
            }}
          >
            PRIVATE OFFICE
          </div>
        </div>

        {/* Hairline */}
        <div style={{ height: '0.5px', background: 'var(--border)' }} />

        {/* Nav items */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.label.toLowerCase() ||
              pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 44,
                  padding: '0 24px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                  background: isActive ? 'rgba(184,150,90,0.04)' : 'transparent',
                  transition: 'color 0.2s',
                }}
                data-hover
              >
                <MagneticButton
                  strength={0.3}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    letterSpacing: 'inherit',
                    textTransform: 'inherit' as never,
                    color: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {item.label}
                </MagneticButton>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ borderTop: '0.5px solid var(--border)' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 44,
              padding: '0 24px',
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              width: '100%',
              transition: 'color 0.2s',
            }}
            data-hover
          >
            <LogOut size={14} strokeWidth={1.5} />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className="flex items-center justify-center md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: activePage === 'market' ? 'var(--obsidian)' : 'var(--linen)',
          zIndex: 50,
          borderBottom: '0.5px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            letterSpacing: '0.3em',
            color: activePage === 'market' ? 'var(--gold)' : 'var(--text-dark)',
          }}
        >
          SOLUS
        </span>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="flex items-center md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'rgba(12,10,8,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '0.5px solid var(--border)',
          zIndex: 50,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.label.toLowerCase() ||
            pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
                flex: 1,
                minHeight: 44,
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                color={isActive ? 'var(--gold)' : 'var(--text-muted)'}
              />
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  textAlign: 'center',
                  padding: '0 2px',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Main content */}
      <main
        className="md:ml-[220px] pb-20 pt-14 md:pb-0 md:pt-0"
        style={{ minHeight: '100vh' }}
      >
        {children}
      </main>
    </>
  )
}
