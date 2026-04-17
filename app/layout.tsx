import './globals.css'

import {AppProviders} from '@/components/providers/AppProviders'
import type {Metadata} from 'next'
import {IBM_Plex_Mono, Inter} from 'next/font/google'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const ibm = IBM_Plex_Mono({
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Neutral System Builder',
    template: '%s | Neutral System Builder',
  },
  description:
    'Generate and export systematic neutral palettes with Color.js — global scale, theme mapping, and tokens.',
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibm.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
