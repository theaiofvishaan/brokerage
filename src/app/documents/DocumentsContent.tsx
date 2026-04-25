'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SolusLayout from '@/components/SolusLayout'

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


const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 8,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'var(--gold-dim)',
  display: 'block',
  marginBottom: 4,
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

export default function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchDocuments = useCallback(async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setDocuments(data as Document[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const filtered = activeFilter === 'ALL'
    ? documents
    : documents.filter(d => d.category?.toUpperCase() === activeFilter)

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <SolusLayout activePage="documents">
      <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
        <main className="px-6 md:px-12">
          <div className="pt-16 md:pt-16 pb-8">
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 60,
                fontWeight: 300,
                color: 'var(--text-dark)',
              }}
            >
              Documents
            </h1>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 20 }}>
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

          <div className="hairline" />

          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ border: '0.5px solid rgba(184,150,90,0.15)', padding: '22px 16px', borderTop: i === 0 ? undefined : 'none' }}>
                  <div className="skeleton" style={{ height: 10, width: '25%', marginBottom: 10, borderRadius: 2 }} />
                  <div className="skeleton" style={{ height: 18, width: '50%', borderRadius: 2 }} />
                </div>
              ))
            ) : (
              <>
                <AnimatePresence>
                  {filtered.map((doc, i) => (
                    <DocumentRow key={doc.id} document={doc} index={i} formatDate={formatDate} />
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                  <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
                      {documents.length === 0 ? 'No documents added yet.' : 'No documents found'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* FAB */}
        <div className="fab-wrapper block bottom-20 md:bottom-6" style={{ position: 'fixed', right: 24, zIndex: 50 }}>
          <span className="fab-tooltip">Add Document</span>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            title="Add Document"
            aria-label="Add Document"
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
              boxShadow: '0 4px 16px rgba(184,150,90,0.12)',
            }}
            data-hover
          >
            +
          </motion.button>
        </div>

        <AddDocumentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchDocuments}
        />
      </div>
    </SolusLayout>
  )
}

function DocumentRow({ document: doc, index, formatDate }: { document: Document; index: number; formatDate: (d: string) => string }) {
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
        className="document-row"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          alignItems: 'center',
          gap: 24,
          padding: '22px 16px',
          borderBottom: '0.5px solid var(--border-light)',
          background: hovered ? 'rgba(234,228,214,0.3)' : 'transparent',
          transition: 'background 100ms',
        }}
      >
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: 'var(--text-dark)',
            lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {doc.title}
          </div>
          {doc.description && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>
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
            color: 'var(--gold)',
            border: '0.5px solid var(--gold)',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}>
            {doc.category}
          </span>
        )}

        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}>
          {formatDate(doc.created_at)}
        </span>

        {doc.drive_url ? (
          <motion.a
            href={doc.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.15 }}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 16, color: 'var(--gold)', textDecoration: 'none' }}
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
              background: 'var(--white)', borderTop: '0.5px solid var(--border)',
              zIndex: 201, padding: '48px 64px 64px', maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'var(--text-dark)' }}>
                  Add Document
                </h2>
                <div style={{ height: '0.5px', width: 60, background: 'var(--gold)', marginTop: 12 }} />
              </div>
              <button onClick={onClose} data-hover style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--gold-dim)', background: 'none', border: 'none' }}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 48px', maxWidth: 800 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Title *</label>
                <input name="title" value={form.title} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <input name="description" value={form.description} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select name="category" value={form.category} onChange={update}
                  style={{ ...inputStyle, background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Google Drive URL</label>
                <input name="drive_url" value={form.drive_url} onChange={update} type="url" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
            </div>

            {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(184,150,90,0.5)', marginTop: 16 }}>{error}</p>}

            <div style={{ marginTop: 40 }}>
              <button onClick={handleSave} disabled={saving} data-hover
                style={{
                  background: 'var(--gold)', color: 'var(--obsidian)', fontFamily: 'var(--font-ui)',
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
