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

const FILTER_PILLS = [
  'ALL', 'REAL ESTATE', 'INTERNAL', 'CONSTRUCTION', 'LEGAL',
  'DESIGN', 'BUILDERS', 'GOVERNMENT', 'PERSONAL', 'OTHER',
]

const CONSTRUCTION_TYPES = [
  'general contractor', 'civil engineer', 'architect', 'landscape architect',
  'surveyor', 'geotech', 'estimator', 'demo', 'demolition', 'demo / demolition',
  'building materials', 'draftsman', 'environmental', 'hvac', 'elevator',
  'seawall', 'pools', 'fence',
]

const DESIGN_TYPES = [
  'interior design', 'interior designer', 'video and photo',
  'staging', 'branding', 'signs', 'photography',
]

function matchesFilter(contact: Contact, filter: string): boolean {
  const vt = (contact.vendor_type ?? '').toLowerCase()
  switch (filter) {
    case 'ALL': return true
    case 'REAL ESTATE': return vt.includes('real estate') || vt.includes('realtor')
    case 'INTERNAL': return vt.includes('internal')
    case 'CONSTRUCTION': return CONSTRUCTION_TYPES.some(t => vt.includes(t))
    case 'LEGAL': return vt.includes('attorney') || vt === 'title' || vt === 'land use attorney'
    case 'DESIGN': return DESIGN_TYPES.some(t => vt.includes(t))
    case 'BUILDERS': return vt.includes('builder')
    case 'GOVERNMENT': return vt === 'government'
    case 'PERSONAL': return vt === 'personal'
    case 'OTHER': {
      if (!vt) return true
      return ![
        'REAL ESTATE', 'INTERNAL', 'CONSTRUCTION', 'LEGAL',
        'DESIGN', 'BUILDERS', 'GOVERNMENT', 'PERSONAL',
      ].some(f => f !== 'OTHER' && matchesFilter(contact, f))
    }
    default: return true
  }
}

function getInitials(c: Contact) {
  if (c.first_name && c.last_name) {
    return `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
  }
  if (c.organization) {
    return c.organization.slice(0, 2).toUpperCase()
  }
  return '?'
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [sort, setSort] = useState('name_asc')
  const [modalOpen, setModalOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase.from('contacts').select('*').order('first_name', { ascending: true })
    if (data) setContacts(data as Contact[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }, [])

  const filtered = useMemo(() => {
    let list = [...contacts]

    if (activeFilter !== 'ALL') {
      list = list.filter(c => matchesFilter(c, activeFilter))
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
      <SolusNav />

      {/* Header */}
      <div style={{ padding: '120px 64px 40px' }}>
        <RevealText
          text="Directory"
          tag="h1"
          style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 64,
            fontWeight: 300,
            color: '#1A1510',
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
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#C9A96E',
          }}
        >
          {loading ? '— loading' : `— ${contacts.length} contacts`}
        </motion.p>
      </div>

      {/* Controls row */}
      <div style={{ padding: '0 64px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, organization..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: '0.5px solid #D0C8B8',
            color: '#1A1510',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            padding: '12px 0',
            outline: 'none',
          }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            background: 'transparent',
            border: '0.5px solid #D0C8B8',
            color: '#8a7a60',
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '10px 20px',
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
      <div
        style={{
          padding: '20px 64px',
          display: 'flex',
          gap: 8,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.filter-scroll::-webkit-scrollbar { display: none; }`}</style>
        {FILTER_PILLS.map(pill => (
          <button
            key={pill}
            onClick={() => setActiveFilter(pill)}
            className={`filter-pill${activeFilter === pill ? ' active' : ''}`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Contact rows */}
      <div style={{ padding: '0 48px' }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 200px 160px 24px',
                alignItems: 'center',
                gap: 24,
                padding: '18px 16px',
                borderBottom: '0.5px solid #F0E8DC',
              }}
            >
              <div className="skeleton-linen" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div>
                <div className="skeleton-linen" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton-linen" style={{ height: 10, width: '40%' }} />
              </div>
              <div className="skeleton-linen" style={{ height: 10, width: '70%' }} />
              <div className="skeleton-linen" style={{ height: 10, width: '60%' }} />
            </div>
          ))
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
              color: 'rgba(180,160,120,0.5)',
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
        <div style={{ padding: '24px 64px 64px' }}>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: '#b0a080',
            letterSpacing: '0.2em',
          }}>
            {filtered.length} contacts &middot; SOLUS Directory
          </span>
        </div>
      )}

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#C9A96E',
          color: '#080806',
          border: 'none',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(201,169,110,0.25)',
          zIndex: 50,
        }}
        data-cursor="hover"
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
  const phone = contact.phone?.split(' ::: ')[0] ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.4) }}
    >
      <Link href={`/contacts/${contact.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr 200px 160px 24px',
            alignItems: 'center',
            gap: 24,
            padding: '18px 16px',
            borderBottom: '0.5px solid #F0E8DC',
            background: hovered ? 'rgba(234,228,214,0.4)' : 'transparent',
            transition: 'background 100ms',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#C9A96E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 16,
              fontWeight: 400,
              color: '#FAFAF6',
              flexShrink: 0,
            }}
          >
            {getInitials(contact)}
          </div>

          {/* Name + org */}
          <div>
            <div style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: '#1A1510',
              lineHeight: 1.2,
            }}>
              {contact.first_name} {contact.last_name}
            </div>
            {contact.organization && (
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: '#8a7a60',
                marginTop: 2,
              }}>
                {contact.organization}
              </div>
            )}
          </div>

          {/* Vendor type */}
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#b0a080',
          }}>
            {contact.vendor_type ?? '—'}
          </div>

          {/* Phone */}
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: '#8a7a60',
          }}>
            {phone}
          </div>

          {/* Chevron */}
          <motion.span
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 16,
              color: '#D0C8B8',
            }}
          >
            &rsaquo;
          </motion.span>
        </div>
      </Link>
    </motion.div>
  )
}
