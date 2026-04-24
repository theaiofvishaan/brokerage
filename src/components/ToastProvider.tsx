'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#080806',
          color: '#C9A96E',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          letterSpacing: '0.1em',
          border: '0.5px solid rgba(201,169,110,0.2)',
          borderRadius: 2,
          padding: '12px 20px',
        },
        success: {
          iconTheme: {
            primary: '#C9A96E',
            secondary: '#080806',
          },
        },
      }}
    />
  )
}
