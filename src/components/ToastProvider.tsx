'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--card)',
          color: 'var(--gold)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          letterSpacing: '0.1em',
          border: '0.5px solid var(--border)',
          borderRadius: 2,
          padding: '12px 20px',
        },
        success: {
          iconTheme: {
            primary: '#B8965A',
            secondary: '#111009',
          },
        },
      }}
    />
  )
}
