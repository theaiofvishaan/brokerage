'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'

interface Presentation {
  id: string
  created_at: string
  title: string | null
  description: string | null
  status: string | null
  external_url: string | null
  added_by: string | null
}

const STATUS_OPTIONS = ['In Preparation', 'Active', 'Sent', 'Closed']

const SEED_ROW: Omit<Presentation, 'id' | 'created_at' | 'added_by'> = {
  title: 'Coastal Pointe Homes',
  description: 'Builder partnership proposal — Tampa luxury homebuilder',
  status: 'In Preparation',
  external_url: 'https://gamma.app/docs/A-Better-Model-yroskr97tce387p',
}

function statusColor(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'active': return '#4a7c59'
    case 'sent': return '#5a7ca0'
    case 'closed': return '#888'
    default: return '#8B7248'
  }
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 8,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: '#8B7248',
  display: 'block',
  marginBottom: 4,
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

export default function PresentationsPage() {
  const router = useRouter()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchPresentations = useCallback(async () => {
    const { data } = await supabase
      .from('presentations')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPresentations(data as Presentation[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPresentations()
  }, [fetchPresentations])

  const rows = loading
    ? []
    : presentations.length > 0
    ? presentations
    : [{ ...SEED_ROW, id: '__seed__', created_at: new Date().toISOString(), added_by: null }]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
      <SolusNav />

      <main style={{ padding: '0 64px' }}>
        <div style={{ padding: '120px 0 48px' }}>
          <RevealText
            text="Presentations"
            tag="h1"
            style={{
              fontFamily: 'var(--font-cormorant), var(--font-display)',
              fontSize: 64,
              fontWeight: 300,
              color: '#1A1510',
              letterSpacing: '0.02em',
              marginBottom: 12,
            }}
            delay={0.1}
          />
        </div>

        <div className="hairline" />

        <div>
          <AnimatePresence>
            {rows.map((p, i) => (
              <PresentationRow key={p.id} presentation={p} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </main>

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

      <AddPresentationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchPresentations}
      />
    </div>
  )
}

function PresentationRow({ presentation: p, index }: { presentation: Presentation; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          alignItems: 'center',
          gap: 32,
          padding: '28px 16px',
          borderBottom: '0.5px solid #F0E8DC',
          background: hovered ? 'rgba(234,228,214,0.4)' : 'transparent',
          transition: 'background 100ms',
        }}
      >
        <div>
          <div style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            color: '#1A1510',
            lineHeight: 1.2,
            marginBottom: 6,
          }}>
            {p.title}
          </div>
          {p.description && (
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: '#8a7a60',
            }}>
              {p.description}
            </div>
          )}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 8,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: statusColor(p.status),
            border: `0.5px solid ${statusColor(p.status)}`,
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          {p.status ?? '—'}
        </span>

        {p.external_url ? (
          <motion.a
            href={p.external_url}
            target="_blank"
            rel="noopener noreferrer"
            animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 16,
              color: '#C9A96E',
              textDecoration: 'none',
            }}
            onClick={e => e.stopPropagation()}
          >
            &nearr;
          </motion.a>
        ) : (
          <span style={{ width: 24 }} />
        )}
      </div>
    </motion.div>
  )
}

function AddPresentationModal({
  open, onClose, onSaved,
}: {
  open: boolean; onClose: () => void; onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', status: 'In Preparation', external_url: '',
  })

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('presentations').insert({
      title: form.title,
      description: form.description || null,
      status: form.status,
      external_url: form.external_url || null,
      added_by: user?.id ?? null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setForm({ title: '', description: '', status: 'In Preparation', external_url: '' })
    onSaved(); onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,6,0.5)', backdropFilter: 'blur(4px)', zIndex: 200 }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#FAFAF6', borderTop: '0.5px solid var(--hairline)',
              zIndex: 201, padding: '48px 64px 64px', maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-cormorant), var(--font-display)', fontSize: 36, fontWeight: 300, color: '#1A1510' }}>
                  Add Presentation
                </h2>
                <div style={{ height: '0.5px', width: 60, background: '#C9A96E', marginTop: 12 }} />
              </div>
              <button onClick={onClose} style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#8B7248', background: 'none', border: 'none' }}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 48px', maxWidth: 800 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Title *</label>
                <input name="title" value={form.title} onChange={update} style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <input name="description" value={form.description} onChange={update} style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={form.status} onChange={update}
                  style={{ ...inputStyle, background: 'transparent' }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>External Link URL</label>
                <input name="external_url" value={form.external_url} onChange={update} type="url" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')} />
              </div>
            </div>

            {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(201,169,110,0.6)', marginTop: 16 }}>{error}</p>}

            <div style={{ marginTop: 40 }}>
              <button onClick={handleSave} disabled={saving}
                style={{
                  background: '#C9A96E', color: '#080806', fontFamily: 'var(--font-ui)',
                  fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase',
                  border: 'none', padding: '16px 48px', opacity: saving ? 0.6 : 1, transition: 'opacity 0.2s',
                }}>
                {saving ? 'Saving...' : 'Add Presentation'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
