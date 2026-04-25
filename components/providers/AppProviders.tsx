'use client'

import {useSyncExternalStore, type ReactNode} from 'react'
import {useTheme} from 'next-themes'

import {ThemeProvider} from '@/components/providers/ThemeProvider'
import {TooltipProvider} from '@/components/ui/tooltip'
import {Toaster} from 'sonner'

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
              'backdrop-blur-xl border-[color:var(--ns-hairline-strong)] bg-[color:var(--ns-toaster-bg)]',
            title: 'text-[color:var(--ns-text)]',
            description: 'text-[color:var(--ns-text-muted)]',
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
