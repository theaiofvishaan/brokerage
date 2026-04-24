'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SolusNav from '@/components/SolusNav'
import RevealText from '@/components/RevealText'

interface Document {
  id: string
  created_at: string
  title: string | null
  description: string | null
  category: string | null
  drive_url: string | null
  added_by: string | null
}

const CATEGORIES = ['General', 'Pitches', 'Legal', 'Research', 'Templates', 'Market Data']
const FILTER_PILLS = ['ALL', 'PITCHES', 'LEGAL', 'RESEARCH', 'TEMPLATES', 'MARKET DATA']

const SEED_DOC = {
  title: 'SOLUS — Shared Drive',
  category: 'General',
  description: 'Main shared Google Drive folder',
  drive_url: 'https://drive.google.com/drive/folders/1_Frm1uNKTD_iNK6ZWepT3NOjjrVVLTGj?usp=sharing',
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

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const fetchDocuments = useCallback(async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setDocuments(data as Document[])
      if (data.length === 0 && !seeded) {
        setSeeded(true)
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('documents').insert({
          ...SEED_DOC,
          added_by: user?.id ?? null,
        })
        const { data: refreshed } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
        if (refreshed) setDocuments(refreshed as Document[])
      }
    }
    setLoading(false)
  }, [seeded])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filtered = activeFilter === 'ALL'
    ? documents
    : documents.filter(d => d.category?.toUpperCase() === activeFilter)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF6' }}>
      <SolusNav />

      <main style={{ padding: '0 64px' }}>
        <div style={{ padding: '120px 0 48px' }}>
          <RevealText
            text="Documents"
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
            {loading ? '— loading' : `— ${documents.length} document${documents.length !== 1 ? 's' : ''}`}
          </motion.p>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 20 }}
        >
          {FILTER_PILLS.map(pill => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`filter-pill${activeFilter === pill ? ' active' : ''}`}
            >
              {pill}
            </button>
          ))}
        </motion.div>

        <div className="hairline" />

        <div>
          <AnimatePresence>
            {!loading && filtered.map((doc, i) => (
              <DocumentRow key={doc.id} document={doc} index={i} />
            ))}
          </AnimatePresence>

          {!loading && filtered.length === 0 && (
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
                No documents found
              </p>
            </motion.div>
          )}
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

      <AddDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchDocuments}
      />
    </div>
  )
}

function DocumentRow({ document: doc, index }: { document: Document; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 24px',
          alignItems: 'center',
          gap: 24,
          padding: '22px 16px',
          borderBottom: '0.5px solid #F0E8DC',
          background: hovered ? 'rgba(234,228,214,0.4)' : 'transparent',
          transition: 'background 100ms',
        }}
      >
        <div>
          <div style={{
            fontFamily: 'var(--font-cormorant), var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: '#1A1510',
            lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {doc.title}
          </div>
          {doc.description && (
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: '#8a7a60',
            }}>
              {doc.description}
            </div>
          )}
        </div>

        {doc.category && (
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 8,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#C9A96E',
            border: '0.5px solid #C9A96E',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}>
            {doc.category}
          </span>
        )}

        {doc.drive_url ? (
          <motion.a
            href={doc.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.15 }}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 16, color: '#C9A96E', textDecoration: 'none' }}
          >
            &rarr;
          </motion.a>
        ) : (
          <span style={{ width: 24 }} />
        )}
      </div>
    </motion.div>
  )
}

function AddDocumentModal({
  open, onClose, onSaved,
}: {
  open: boolean; onClose: () => void; onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', drive_url: '',
  })

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('documents').insert({
      title: form.title,
      description: form.description || null,
      category: form.category,
      drive_url: form.drive_url || null,
      added_by: user?.id ?? null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setForm({ title: '', description: '', category: 'General', drive_url: '' })
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
                  Add Document
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
                <label style={labelStyle}>Category</label>
                <select name="category" value={form.category} onChange={update}
                  style={{ ...inputStyle, background: 'transparent' }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A96E')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--hairline)')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Google Drive URL</label>
                <input name="drive_url" value={form.drive_url} onChange={update} type="url" style={inputStyle}
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
                {saving ? 'Saving...' : 'Add Document'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
