'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { NewContact } from '@/lib/supabase'

const VENDOR_TYPES = [
  'Architect', 'Attorney', 'Branding', 'Builder', 'Building Materials',
  'Civil Engineer', 'Demo / Demolition', 'Draftsman', 'Elevator',
  'Environmental', 'Estimator', 'Fence', 'General Contractor', 'Geotech',
  'Government', 'Home Inspector', 'HVAC', 'Insurance', 'Interior Design', 'Internal',
  'Land Use Attorney', 'Landscape Architect', 'Personal', 'Photography',
  'Pools', 'Real Estate', 'Realtor', 'Research', 'Seawall', 'Signs', 'Staging',
  'Surveyor', 'Title', 'Video and Photo', 'Other',
]

interface AddContactModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 8,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: 'var(--gold-muted)',
  display: 'block',
  marginBottom: 8,
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

export default function AddContactModal({ open, onClose, onSaved }: AddContactModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({
    first_name: '', last_name: '', organization: '', vendor_type: '',
    phone: '', email: '', address: '', city: '', state: '', website: '', notes: '',
  })

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSave() {
    if (!form.first_name.trim()) { setError('First name is required.'); return }
    setSaving(true)
    setError(null)

    const payload: NewContact = {
      first_name: form.first_name,
      last_name: form.last_name,
      organization: form.organization || undefined,
      vendor_type: form.vendor_type || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      website: form.website || undefined,
      notes: form.notes || undefined,
    }

    const { error: err } = await supabase.from('contacts').insert(payload)
    setSaving(false)
    if (err) { setError(err.message); return }
    setForm({ first_name: '', last_name: '', organization: '', vendor_type: '', phone: '', email: '', address: '', city: '', state: '', website: '', notes: '' })
    toast.success('Contact added')
    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(8,8,6,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'var(--white)',
              borderTop: '0.5px solid var(--border)',
              zIndex: 201,
              padding: '48px 64px 64px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36,
                  fontWeight: 300,
                  color: 'var(--text-dark)',
                }}>
                  Add Contact
                </h2>
                <div style={{ height: '0.5px', width: 60, background: 'var(--gold)', marginTop: 12 }} />
              </div>
              <button
                onClick={onClose}
                data-hover
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-dim)',
                  background: 'none',
                  border: 'none',
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 48px', maxWidth: 800 }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input name="first_name" value={form.first_name} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Organization</label>
                <input name="organization" value={form.organization} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Vendor Type</label>
                <select name="vendor_type" value={form.vendor_type} onChange={update}
                  style={{ ...inputStyle, background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}>
                  <option value="">— Select —</option>
                  {VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" value={form.phone} onChange={update} type="tel" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" value={form.email} onChange={update} type="email" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input name="address" value={form.address} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input name="city" value={form.city} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input name="state" value={form.state} onChange={update} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input name="website" value={form.website} onChange={update} type="url" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  name="notes" value={form.notes} onChange={update} rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--gold)')}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')} />
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(184,150,90,0.5)', marginTop: 16 }}>
                {error}
              </p>
            )}

            <div style={{ marginTop: 40 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                data-hover
                style={{
                  width: '100%',
                  background: 'var(--gold)',
                  color: 'var(--obsidian)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  letterSpacing: '0.5em',
                  textTransform: 'uppercase',
                  border: 'none',
                  padding: '16px 0',
                  opacity: saving ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'SAVE'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
