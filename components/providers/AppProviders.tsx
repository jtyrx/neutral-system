'use client'

import {useSyncExternalStore, type ReactNode} from 'react'
import dynamic from 'next/dynamic'
import {useTheme} from 'next-themes'

import {ThemeProvider} from '@/components/providers/ThemeProvider'
import {TooltipProvider} from '@/components/ui/tooltip.tsx'

const Toaster = dynamic(
  () => import('sonner').then((m) => ({default: m.Toaster})),
  {ssr: false, loading: () => null},
)

type Props = {
  children: ReactNode
}

function useResolvedTheme(): 'light' | 'dark' {
  const {resolvedTheme} = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) return 'dark'
  return resolvedTheme === 'light' ? 'light' : 'dark'
}

function AppProviderContent({children}: Props) {
  const theme = useResolvedTheme()

  return (
    <TooltipProvider>
      {children}
      <Toaster
        position="top-center"
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'backdrop-blur-xl border-[color:var(--chrome-hairline-strong)] bg-[color:var(--chrome-toaster-bg)]',
            title: 'text-[color:var(--color-text-default)]',
            description: 'text-[color:var(--color-text-muted)]',
          },
        }}
      />
    </TooltipProvider>
  )
}

export function AppProviders({children}: Props) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="neutral-system-theme"
    >
      <AppProviderContent>{children}</AppProviderContent>
    </ThemeProvider>
  )
}
