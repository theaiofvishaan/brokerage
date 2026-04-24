import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import ClientCursor from '@/components/ClientCursor'
import ScrollProgress from '@/components/ScrollProgress'
import ToastProvider from '@/components/ToastProvider'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SOLUS — Real Estate Partners',
  description: 'Private platform. SOLUS Real Estate Partners, Tampa Bay.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <ClientCursor />
        <ScrollProgress />
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
