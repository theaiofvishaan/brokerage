import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import ClientCursor from '@/components/ClientCursor'
import ScrollProgress from '@/components/ScrollProgress'
import ToastProvider from '@/components/ToastProvider'
import LenisProvider from '@/components/LenisProvider'
import PageTransition from '@/components/PageTransition'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SOLUS — Private Office',
  description: 'Private platform. SOLUS Real Estate Partners.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <ClientCursor />
        <ScrollProgress />
        <ToastProvider />
        <LenisProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </LenisProvider>
      </body>
    </html>
  )
}
