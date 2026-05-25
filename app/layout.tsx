import './globals.css'

import {AppLayoutShell} from '@/components/app-sidebar'
import {AppProviders} from '@/components/providers/AppProviders'
import {DefaultThemeStyles} from '@/components/providers/DefaultThemeStyles'
import type {Metadata} from 'next'
import localFont from 'next/font/local'
import {cn} from '@/lib/utils'

const geist = localFont({
  src: './fonts/geist-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
})

const inter = localFont({
  src: './fonts/inter-latin.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
})

const ibm = localFont({
  src: [
    {
      path: './fonts/ibm-plex-mono-latin-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/ibm-plex-mono-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/ibm-plex-mono-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
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

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, ibm.variable, 'font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <DefaultThemeStyles />
      </head>
      <body>
        {/* Base UI Quick Start: isolation stacking context for portaled popups (tooltips, dialogs). */}
        <div className="isolate min-h-screen">
          <AppProviders>
            <AppLayoutShell>{children}</AppLayoutShell>
          </AppProviders>
        </div>
      </body>
    </html>
  )
}
