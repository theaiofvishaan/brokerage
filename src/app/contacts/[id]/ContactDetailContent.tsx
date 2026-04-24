'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getInitials(first: string | null, last: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '0.5px solid var(--hairline)',
  color: '#1A1510',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  padding: '10px 0',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 8,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: '#8B7248',
  display: 'block',
  marginBottom: 6,
}

function InfoRow({ label, value, href }: { label: string; value: string | null | undefined; href?: string }) {
  if (!value) return null
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '16px 0',
      borderBottom: '0.5px solid var(--hairline)',
    }}>
      <span style={labelStyle}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: 'var(--font-ui)', fontSize: 13, color: '#C9A96E', textDecoration: 'none',
        }}>
          {value}
        </a>
      ) : (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#1A1510' }}>{value}</span>
      )}
    </div>
  )
}

function SaveFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 8,
            letterSpacing: '0.3em',
            color: '#C9A96E',
            textTransform: 'uppercase',
            marginLeft: 12,
          }}
        >
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export default function ContactDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)

  const [convoDate, setConvoDate] = useState('')
  const [convoNotes, setConvoNotes] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [personalNotes, setPersonalNotes] = useState('')
  const [flashConvo, setFlashConvo] = useState(false)
  const [flashMeeting, setFlashMeeting] = useState(false)
  const [flashPersonal, setFlashPersonal] = useState(false)

  const [editForm, setEditForm] = useState<Partial<Contact>>({})

  useEffect(() => {
    supabase.from('contacts').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return }
      const c = data as Contact
      setContact(c)
      setConvoDate(c.last_conversation_date ?? '')
      setConvoNotes(c.last_conversation_notes ?? '')
      setMeetingNotes(c.notes ?? '')
      setPersonalNotes(c.personal_notes ?? '')
      setLoading(false)
    })
  }, [id])

  function showFlash(setter: (v: boolean) => void) {
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  async function saveConvo() {
    if (!contact) return
    const { data } = await supabase.from('contacts')
      .update({ last_conversation_date: convoDate || null, last_conversation_notes: convoNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    showFlash(setFlashConvo)
  }

  async function saveMeeting() {
    if (!contact) return
    const { data } = await supabase.from('contacts')
      .update({ notes: meetingNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    showFlash(setFlashMeeting)
  }

  async function savePersonal() {
    if (!contact) return
    const { data } = await supabase.from('contacts')
      .update({ personal_notes: personalNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    showFlash(setFlashPersonal)
  }

  async function saveEdit() {
    if (!contact) return
    const { data } = await supabase.from('contacts')
      .update(editForm)
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    setEditing(false)
  }

  function startEdit() {
    if (!contact) return
    setEditForm({
      first_name: contact.first_name ?? '',
      last_name: contact.last_name ?? '',
      organization: contact.organization ?? '',
      vendor_type: contact.vendor_type ?? '',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      address: contact.address ?? '',
      city: contact.city ?? '',
      state: contact.state ?? '',
      website: contact.website ?? '',
    })
    setEditing(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
        <SolusNav />
        <div style={{ padding: '120px 64px' }}>
          {[300, 200, 400, 160].map((w, i) => (
            <div key={i} className="skeleton-linen" style={{ height: i === 0 ? 60 : 12, width: w, marginBottom: 24 }} />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !contact) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
        <SolusNav />
        <div style={{ padding: '160px 64px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cormorant), var(--font-display)', fontSize: 32, fontWeight: 300, color: 'rgba(180,160,120,0.5)', marginBottom: 24 }}>
            Contact not found
          </p>
          <Link href="/contacts" style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', color: '#C9A96E', textDecoration: 'none', textTransform: 'uppercase' }}>
            &larr; Directory
          </Link>
        </div>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
      <SolusNav />

      <main style={{ padding: '0 64px 80px' }}>
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ paddingTop: 100, marginBottom: 48 }}
        >
          <Link
            href="/contacts"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.3em',
              color: '#C9A96E',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            &larr; Directory
          </Link>
        </motion.div>

        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 64 }}>
          <div style={{ flex: 1 }}>
            <RevealText
              text={fullName || 'Unknown'}
              tag="h1"
              style={{
                fontFamily: 'var(--font-cormorant), var(--font-display)',
                fontSize: 56,
                fontWeight: 300,
                color: '#1A1510',
                lineHeight: 1,
                marginBottom: 10,
              }}
            />
            {contact.organization && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#8a7a60', marginBottom: 12 }}
              >
                {contact.organization}
              </motion.p>
            )}
            {contact.vendor_type && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 8,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#8B7248',
                  border: '0.5px solid var(--hairline)',
                  padding: '5px 14px',
                }}
              >
                {contact.vendor_type}
              </motion.span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
            {editing ? (
              <>
                <button
                  onClick={saveEdit}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                    background: '#C9A96E', color: '#080806', border: 'none', padding: '10px 24px',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                    background: 'none', color: '#8B7248', border: '0.5px solid var(--hairline)', padding: '10px 24px',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                  background: 'none', color: '#8B7248', border: '0.5px solid var(--hairline)', padding: '10px 24px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A96E'; e.currentTarget.style.borderColor = '#C9A96E' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8B7248'; e.currentTarget.style.borderColor = 'var(--hairline)' }}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64 }}>
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 style={{
              fontFamily: 'var(--font-ui)', fontSize: 8, letterSpacing: '0.45em',
              textTransform: 'uppercase', color: '#8B7248', marginBottom: 4,
            }}>
              Contact Information
            </h3>

            {editing ? (
              <div style={{ display: 'grid', gap: 24, paddingTop: 16 }}>
                {([
                  ['First Name', 'first_name'],
                  ['Last Name', 'last_name'],
                  ['Organization', 'organization'],
                  ['Vendor Type', 'vendor_type'],
                  ['Phone', 'phone'],
                  ['Email', 'email'],
                  ['Address', 'address'],
                  ['City', 'city'],
                  ['State', 'state'],
                  ['Website', 'website'],
                ] as [string, keyof Contact][]).map(([label, field]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      value={(editForm[field] as string) ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                      onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <InfoRow label="Phone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : undefined} />
                <InfoRow label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
                <InfoRow label="Address" value={contact.address} />
                <InfoRow label="City" value={contact.city && contact.state ? `${contact.city}, ${contact.state}` : contact.city ?? contact.state} />
                <InfoRow label="Website" value={contact.website} href={contact.website ?? undefined} />
                <InfoRow label="Added" value={formatDate(contact.created_at)} />
              </div>
            )}
          </motion.div>

          {/* Right: notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
          >
            <NoteSection title="Last Conversation" flash={flashConvo}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={convoDate}
                  onChange={e => setConvoDate(e.target.value)}
                  onBlur={saveConvo}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={convoNotes}
                  onChange={e => setConvoNotes(e.target.value)}
                  onBlur={saveConvo}
                  rows={4}
                  placeholder="What was discussed..."
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                />
              </div>
            </NoteSection>

            <NoteSection title="Meeting Notes" flash={flashMeeting}>
              <textarea
                value={meetingNotes}
                onChange={e => setMeetingNotes(e.target.value)}
                onBlur={saveMeeting}
                rows={5}
                placeholder="Notes from meetings and site visits..."
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
              />
            </NoteSection>

            <NoteSection title="Personal Notes" flash={flashPersonal}>
              <textarea
                value={personalNotes}
                onChange={e => setPersonalNotes(e.target.value)}
                onBlur={savePersonal}
                rows={4}
                placeholder="Family, preferences, key dates..."
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
              />
            </NoteSection>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function NoteSection({ title, children, flash }: { title: string; children: React.ReactNode; flash: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{
          fontFamily: 'var(--font-ui)', fontSize: 8, letterSpacing: '0.45em',
          textTransform: 'uppercase', color: '#8B7248',
        }}>
          {title}
        </h3>
        <SaveFlash show={flash} />
      </div>
      <div style={{ borderTop: '0.5px solid var(--hairline)', paddingTop: 16 }}>
        {children}
      </div>
    </div>
  )
}
