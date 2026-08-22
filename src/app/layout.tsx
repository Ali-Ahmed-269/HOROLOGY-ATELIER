import type { Metadata } from 'next'
import { Cormorant_Garamond, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

/* ── Editorial Heading Font ─────────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
})

/* ── Technical / Spec Font ──────────────────────────────────────────── */
const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal'],
  display: 'swap',
  preload: false, // secondary — lazy is fine
})

/* ── UI Label / Interface Font ──────────────────────────────────────── */
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'CHRONOS ATELIER — Haute Horlogerie',
  description:
    'A maison of precision mechanical timepieces. Explore movement architecture, hand-finished complications, and the art of Haute Horlogerie.',
  keywords: [
    'haute horlogerie',
    'luxury watches',
    'mechanical movements',
    'swiss watchmaking',
    'complications',
    'CHRONOS ATELIER',
  ],
  openGraph: {
    title: 'CHRONOS ATELIER — Haute Horlogerie',
    description:
      'Precision mechanical timepieces. Explore movement architecture and the art of Haute Horlogerie.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jetbrains.variable} ${spaceGrotesk.variable}`}
      style={{ background: '#0A0A0C' }}
    >
      <body className="min-h-dvh overflow-x-hidden bg-void antialiased">
        {children}
      </body>
    </html>
  )
}
