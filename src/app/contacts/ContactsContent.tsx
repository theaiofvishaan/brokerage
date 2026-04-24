'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'
import AddContactModal from '@/components/AddContactModal'

const DEFAULT_PILLS = ['ALL', 'ARCHITECT', 'ATTORNEY', 'CIVIL ENGINEER', 'REAL ESTATE AGENT', 'SEAWALL', 'POOLS', 'SIGNS', 'DEVELOPER', 'INSURANCE', 'LANDSCAPE ARCHITECT', 'GENERAL CONTRACTOR']

function getInitials(first: string | null, last: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '48px 1fr 180px 140px 24px',
      alignItems: 'center',
      gap: 24,
      padding: '20px 0',
      borderBottom: '0.5px solid rgba(240, 232, 220, 0.8)',
    }}>
      <div className="skeleton-linen" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      <div>
        <div className="skeleton-linen" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skeleton-linen" style={{ height: 10, width: '40%' }} />
      </div>
      <div className="skeleton-linen" style={{ height: 10, width: '70%' }} />
      <div className="skeleton-linen" style={{ height: 10, width: '60%' }} />
    </div>
  )
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [sort, setSort] = useState('name_asc')
  const [vendorTypes, setVendorTypes] = useState<string[]>(DEFAULT_PILLS)
  const [modalOpen, setModalOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase.from('contacts').select('*').order('first_name', { ascending: true })
    if (data) {
      setContacts(data as Contact[])
      const types = Array.from(new Set(data.map((c: Contact) => c.vendor_type).filter(Boolean))) as string[]
      if (types.length > 0) {
        const merged = Array.from(new Set(['ALL', ...DEFAULT_PILLS.slice(1), ...types]))
        setVendorTypes(merged)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/')
    })
    fetchContacts()
  }, [router, fetchContacts])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }, [])

  const filtered = useMemo(() => {
    let list = [...contacts]

    if (activeFilter !== 'ALL') {
      list = list.filter(c => c.vendor_type?.toUpperCase() === activeFilter)
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      )
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'name_asc': return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        case 'name_desc': return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`)
        case 'created_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'vendor_type': return (a.vendor_type ?? '').localeCompare(b.vendor_type ?? '')
        default: return 0
      }
    })

    return list
  }, [contacts, debouncedSearch, activeFilter, sort])

  const lastUpdated = useMemo(() => {
    if (!contacts.length) return null
    const latest = contacts.reduce((a, b) => a.created_at > b.created_at ? a : b)
    return new Date(latest.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }, [contacts])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <SolusNav />

      <main style={{ padding: '0 64px' }}>
        {/* Header */}
        <div style={{ padding: '56px 0 32px' }}>
          <RevealText
            text="Directory"
            tag="h1"
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 60,
              fontWeight: 300,
              color: 'var(--text-dark)',
              letterSpacing: '0.02em',
              marginBottom: 12,
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
            }}
          >
            {loading ? '— loading' : `— ${contacts.length} contacts`}
          </motion.p>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 24 }}
        >
          <div style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            borderBottom: '0.5px solid var(--hairline)',
            paddingBottom: 16,
          }}>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search contacts…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid transparent',
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                padding: '8px 0',
                outline: 'none',
              }}
            />
            <div style={{ height: 20, width: '0.5px', background: 'var(--hairline)', flexShrink: 0 }} />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-dim)',
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="created_desc">Recently Added</option>
              <option value="vendor_type">Type</option>
            </select>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 16, paddingBottom: 8 }}>
            {vendorTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`filter-pill${activeFilter === type ? ' active' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hairline */}
        <div className="hairline" />

        {/* Contact rows */}
        <div>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: '80px 0', textAlign: 'center' }}
            >
              <p style={{
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 28,
                fontWeight: 300,
                color: 'rgba(180, 160, 120, 0.5)',
              }}>
                No contacts found
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filtered.map((contact, i) => (
                <ContactRow key={contact.id} contact={contact} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '24px 0 64px',
              borderTop: '0.5px solid var(--hairline)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(154, 138, 112, 0.6)', letterSpacing: '0.2em' }}>
              {filtered.length} contacts
            </span>
            {lastUpdated && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(154, 138, 112, 0.6)', letterSpacing: '0.2em' }}>
                Last updated {lastUpdated}
              </span>
            )}
          </motion.div>
        )}
      </main>

      {/* Add contact FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--gold)',
          color: 'var(--black)',
          border: 'none',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(201, 169, 110, 0.25)',
          zIndex: 50,
        }}
        data-hover
      >
        +
      </motion.button>

      <AddContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchContacts}
      />
    </div>
  )
}

function ContactRow({ contact, index }: { contact: Contact; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.4) }}
    >
      <Link href={`/contacts/${contact.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 180px 160px 24px',
            alignItems: 'center',
            gap: 24,
            padding: '18px 0',
            borderBottom: '0.5px solid rgba(240, 232, 220, 0.8)',
            background: hovered ? 'rgba(245, 240, 232, 0.6)' : 'transparent',
            transition: 'background 0.2s ease',
            marginLeft: -8,
            marginRight: -8,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--black)',
              flexShrink: 0,
            }}
          >
            {getInitials(contact.first_name, contact.last_name)}
          </div>

          {/* Name + org */}
          <div>
            <div style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: 'var(--text-dark)',
              lineHeight: 1.2,
            }}>
              {contact.first_name} {contact.last_name}
            </div>
            {contact.organization && (
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: 'rgba(154, 138, 112, 0.8)',
                marginTop: 2,
              }}>
                {contact.organization}
              </div>
            )}
          </div>

          {/* Type */}
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold-dim)',
          }}>
            {contact.vendor_type ?? '—'}
          </div>

          {/* Phone */}
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: 'rgba(26, 21, 16, 0.5)',
          }}>
            {contact.phone ?? ''}
          </div>

          {/* Chevron */}
          <motion.span
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 16,
              color: 'var(--gold-dim)',
              opacity: hovered ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          >
            ›
          </motion.span>
        </div>
      </Link>
    </motion.div>
  )
}
