'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/supabase'
import SolusLayout from '@/components/SolusLayout'
import { formatPhone } from '@/lib/utils'

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
  borderBottom: '0.5px solid var(--border)',
  color: 'var(--text-dark)',
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
  color: 'var(--gold-dim)',
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
      borderBottom: '0.5px solid var(--border)',
    }}>
      <span style={labelStyle}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--gold)', textDecoration: 'none',
        }}>
          {value}
        </a>
      ) : (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }}>{value}</span>
      )}
    </div>
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
  const [editForm, setEditForm] = useState<Partial<Contact>>({})
  const origConvoDate = useRef('')
  const origConvoNotes = useRef('')
  const origMeetingNotes = useRef('')
  const origPersonalNotes = useRef('')

  useEffect(() => {
    supabase.from('contacts').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return }
      const c = data as Contact
      setContact(c)
      const cd = c.last_conversation_date ?? ''
      const cn = c.last_conversation_notes ?? ''
      const mn = c.notes ?? ''
      const pn = c.personal_notes ?? ''
      setConvoDate(cd); origConvoDate.current = cd
      setConvoNotes(cn); origConvoNotes.current = cn
      setMeetingNotes(mn); origMeetingNotes.current = mn
      setPersonalNotes(pn); origPersonalNotes.current = pn
      setLoading(false)
    })
  }, [id])

  async function saveConvo() {
    if (!contact) return
    const dateChanged = convoDate !== origConvoDate.current
    const notesChanged = convoNotes !== origConvoNotes.current
    if (!dateChanged && !notesChanged) return
    origConvoDate.current = convoDate
    origConvoNotes.current = convoNotes
    const { data } = await supabase.from('contacts')
      .update({ last_conversation_date: convoDate || null, last_conversation_notes: convoNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    toast.success('Saved')
  }

  async function saveMeeting() {
    if (!contact) return
    if (meetingNotes === origMeetingNotes.current) return
    origMeetingNotes.current = meetingNotes
    const { data } = await supabase.from('contacts')
      .update({ notes: meetingNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    toast.success('Saved')
  }

  async function savePersonal() {
    if (!contact) return
    if (personalNotes === origPersonalNotes.current) return
    origPersonalNotes.current = personalNotes
    const { data } = await supabase.from('contacts')
      .update({ personal_notes: personalNotes || null })
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    toast.success('Saved')
  }

  async function saveEdit() {
    if (!contact) return
    const { data } = await supabase.from('contacts')
      .update(editForm)
      .eq('id', id).select().single()
    if (data) setContact(data as Contact)
    setEditing(false)
    toast.success('Contact updated')
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
      <SolusLayout activePage="contacts">
        <div style={{ minHeight: '100vh', background: 'var(--white)', padding: '80px 64px' }}>
          {[300, 200, 400, 160].map((w, i) => (
            <div key={i} className="skeleton-linen" style={{ height: i === 0 ? 60 : 12, width: w, marginBottom: 24 }} />
          ))}
        </div>
      </SolusLayout>
    )
  }

  if (notFound || !contact) {
    return (
      <SolusLayout activePage="contacts">
        <div style={{ minHeight: '100vh', background: 'var(--white)', padding: '160px 64px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'rgba(184,150,90,0.4)', marginBottom: 24 }}>
            Contact not found
          </p>
          <Link href="/contacts" style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', color: 'var(--gold)', textDecoration: 'none', textTransform: 'uppercase' }}>
            &larr; DIRECTORY
          </Link>
        </div>
      </SolusLayout>
    )
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <SolusLayout activePage="contacts">
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <main className="page-content">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 16 }}
          >
            <Link
              href="/contacts"
              className="back-link"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                letterSpacing: '0.25em',
                color: 'var(--gold)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                padding: '8px 0',
                display: 'inline-block',
              }}
            >
              ← DIRECTORY
            </Link>
          </motion.div>

          {/* Hero */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 64, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 56,
                  fontWeight: 300,
                  color: 'var(--text-dark)',
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {fullName || 'Unknown'}
              </h1>
              {contact.organization && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {contact.organization}
                </p>
              )}
              {contact.vendor_type && (
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 8,
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dim)',
                    border: '0.5px solid var(--border)',
                    padding: '5px 14px',
                  }}
                >
                  {contact.vendor_type}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
              {editing ? (
                <>
                  <button
                    onClick={saveEdit}
                    style={{
                      fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                      background: 'var(--gold)', color: 'var(--obsidian)', border: 'none', padding: '10px 24px',
                    }}
                    data-hover
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                      background: 'none', color: 'var(--gold-dim)', border: '0.5px solid var(--border)', padding: '10px 24px',
                    }}
                    data-hover
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="ghost-btn"
                  data-hover
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 md:gap-16">
            {/* Left: contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', marginBottom: 24,
              }}>
                {getInitials(contact.first_name, contact.last_name)}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-ui)', fontSize: 8, letterSpacing: '0.45em',
                textTransform: 'uppercase', color: 'var(--gold-dim)', marginBottom: 4,
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
                        onChange={(e) => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <InfoRow label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
                  <InfoRow label="Phone" value={contact.phone ? formatPhone(contact.phone.split(' ::: ')[0]) : null} href={contact.phone ? `tel:${contact.phone}` : undefined} />
                  <InfoRow label="Location" value={[contact.address, contact.city, contact.state].filter(Boolean).join(', ') || null} />
                  <InfoRow label="Website" value={contact.website} href={contact.website ?? undefined} />
                  {contact.vendor_type && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 0', borderBottom: '0.5px solid var(--border)',
                    }}>
                      <span style={labelStyle}>Category</span>
                      <span style={{
                        fontFamily: 'var(--font-ui)', fontSize: 8, letterSpacing: '0.4em',
                        textTransform: 'uppercase', color: 'var(--gold)',
                        border: '0.5px solid var(--gold)', padding: '4px 12px',
                      }}>
                        {contact.vendor_type}
                      </span>
                    </div>
                  )}
                  <InfoRow label="Date Added" value={formatDate(contact.created_at)} />
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
              <NoteSection title="Last Conversation">
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={convoDate}
                    onChange={(e) => setConvoDate(e.target.value)}
                    onBlur={saveConvo}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    value={convoNotes}
                    onChange={(e) => setConvoNotes(e.target.value)}
                    onBlur={saveConvo}
                    rows={4}
                    placeholder="What was discussed..."
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Autosaves</span>
                </div>
              </NoteSection>

              <NoteSection title="Meeting Notes">
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  onBlur={saveMeeting}
                  rows={5}
                  placeholder="Notes from meetings and site visits..."
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Autosaves</span>
              </NoteSection>

              <NoteSection title="Personal Notes">
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  onBlur={savePersonal}
                  rows={4}
                  placeholder="Family, preferences, key dates..."
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.65, fontSize: 13 }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Autosaves</span>
              </NoteSection>
            </motion.div>
          </div>
        </main>
      </div>
    </SolusLayout>
  )
}

function NoteSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-ui)', fontSize: 8, letterSpacing: '0.45em',
        textTransform: 'uppercase', color: 'var(--gold-dim)', marginBottom: 16,
      }}>
        {title}
      </h3>
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
        {children}
      </div>
    </div>
  )
}
