import './globals.css'

import {AppLayoutShell} from '@/components/app-sidebar'
import {AppProviders} from '@/components/providers/AppProviders'
import type {Metadata} from 'next'
import {IBM_Plex_Mono, Inter, Geist} from 'next/font/google'
import {cn} from '@/lib/utils'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn(inter.variable, ibm.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProviders>
      </body>
    </html>
  )
}
