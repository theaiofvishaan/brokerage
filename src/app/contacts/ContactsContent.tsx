'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/supabase'
import SolusLayout from '@/components/SolusLayout'
import { InView } from '@/components/ui/in-view'
import AddContactModal from '@/components/AddContactModal'
import { formatPhone } from '@/lib/utils'

const FILTER_PILLS = [
  'ALL CONTACTS',
  'REAL ESTATE',
  'INTERNAL',
  'CONSTRUCTION',
  'LEGAL',
  'BUILDERS',
  'PERSONAL',
  'RESEARCH',
  'OTHER',
]

const CONSTRUCTION_TYPES = [
  'general contractor', 'civil engineer', 'architect', 'landscape architect',
  'surveyor', 'geotech', 'estimator', 'demo', 'demolition', 'demo / demolition',
  'building materials', 'draftsman', 'environmental', 'hvac', 'elevator',
  'seawall', 'pools', 'fence', 'home inspector',
]

function matchesFilter(contact: Contact, filter: string): boolean {
  const vt = (contact.vendor_type ?? '').toLowerCase()
  switch (filter) {
    case 'ALL CONTACTS': return true
    case 'REAL ESTATE': return vt.includes('real estate') || vt.includes('realtor')
    case 'INTERNAL': return vt.includes('internal')
    case 'CONSTRUCTION': return CONSTRUCTION_TYPES.some(t => vt.includes(t))
    case 'LEGAL': return vt.includes('attorney') || vt === 'title' || vt === 'land use attorney'
    case 'BUILDERS': return vt.includes('builder')
    case 'PERSONAL': return vt === 'personal'
    case 'RESEARCH': return vt === 'research'
    case 'OTHER': {
      if (!vt) return true
      return ![
        'REAL ESTATE', 'INTERNAL', 'CONSTRUCTION', 'LEGAL',
        'BUILDERS', 'PERSONAL', 'RESEARCH',
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

export default function ContactsContent() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL CONTACTS')
  const [sort, setSort] = useState('name_asc')
  const [modalOpen, setModalOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase.from('contacts').select('*').order('first_name', { ascending: true })
    if (data) setContacts(data as Contact[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }, [])

  const filtered = useMemo(() => {
    let list = [...contacts]

    if (activeFilter !== 'ALL CONTACTS') {
      list = list.filter(c => matchesFilter(c, activeFilter))
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
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
    <SolusLayout activePage="contacts">
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        {/* Header */}
        <div className="pt-16 md:pt-16 px-6 md:px-12 pb-0">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 60,
              fontWeight: 300,
              color: 'var(--text-dark)',
            }}
            className="text-4xl md:text-6xl"
          >
            Directory
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              marginTop: 8,
            }}
          >
            Internal contact management and routing.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: 'var(--gold)',
              marginTop: 4,
            }}
          >
            {loading ? '— loading' : `— ${contacts.length} contacts`}
          </p>
        </div>

        {/* Search + Sort */}
        <div className="px-6 md:px-12 mt-8" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search network..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '0.5px solid var(--border)',
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              padding: '12px 0',
              outline: 'none',
            }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              background: 'transparent',
              border: '0.5px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '8px 16px',
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
          className="px-6 md:px-12 filter-scroll"
          style={{
            marginTop: 20,
            display: 'flex',
            gap: 8,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {FILTER_PILLS.map((pill) => (
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
        <div className="px-4 md:px-12 mt-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr 180px 160px 20px',
                  alignItems: 'center',
                  gap: 20,
                  padding: '16px 0',
                  borderBottom: '0.5px solid #F5EFE6',
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
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 300,
                  color: 'rgba(184,150,90,0.4)',
                }}
              >
                No contacts found
              </p>
            </div>
          ) : (
            <InView>
              <AnimatePresence>
                {filtered.map((contact, i) => (
                  <ContactRow key={contact.id} contact={contact} index={i} />
                ))}
              </AnimatePresence>
            </InView>
          )}
        </div>

        {/* FAB — desktop only */}
        <div className="fab-wrapper hidden md:block" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
          <span className="fab-tooltip">Add Contact</span>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            title="Add Contact"
            aria-label="Add Contact"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--gold)',
              color: 'var(--obsidian)',
              border: 'none',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(184,150,90,0.25)',
            }}
            data-hover
          >
            +
          </motion.button>
        </div>

        <AddContactModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchContacts}
        />
      </div>
    </SolusLayout>
  )
}

function ContactRow({ contact, index }: { contact: Contact; index: number }) {
  const [hovered, setHovered] = useState(false)
  const rawPhone = contact.phone?.split(' ::: ')[0] ?? ''
  const phone = rawPhone ? formatPhone(rawPhone) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.4) }}
    >
      <Link href={`/contacts/${contact.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Desktop row */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="hidden md:grid"
          style={{
            gridTemplateColumns: '52px 1fr 180px 160px 120px 20px',
            alignItems: 'center',
            gap: 20,
            padding: '16px 0',
            borderBottom: '0.5px solid #F5EFE6',
            background: hovered ? 'rgba(234,228,214,0.3)' : 'transparent',
            transition: 'background 100ms',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {getInitials(contact)}
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 19,
                fontWeight: 400,
                color: 'var(--text-dark)',
                lineHeight: 1.2,
              }}
            >
              {contact.first_name} {contact.last_name}
            </div>
            {contact.organization && (
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {contact.organization}
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-dim)',
            }}
          >
            {contact.vendor_type ?? '—'}
          </div>

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>
            {contact.organization ?? ''}
          </div>

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>
            {phone}
          </div>

          <motion.span
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.15 }}
            style={{ fontSize: 16, color: 'var(--border)' }}
          >
            &rsaquo;
          </motion.span>
        </div>

        {/* Mobile row */}
        <div
          className="md:hidden"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: '0.5px solid #F5EFE6',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {getInitials(contact)}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: 'var(--text-dark)',
              }}
            >
              {contact.first_name} {contact.last_name}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  color: 'var(--gold)',
                }}
              >
                {contact.vendor_type ?? ''}
              </span>
              {phone && (
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  {phone}
                </span>
              )}
            </div>
          </div>

          <span style={{ fontSize: 16, color: 'var(--border)' }}>&rsaquo;</span>
        </div>
      </Link>
    </motion.div>
  )
}
