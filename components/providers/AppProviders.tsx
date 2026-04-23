'use client'

import {useEffect, useState, type ReactNode} from 'react'
import {TooltipProvider} from '@/components/ui/tooltip'
import {Toaster} from 'sonner'

type Props = {
  children: ReactNode
}

/**
 * Reads the current global theme off `<html data-theme>` (written by {@link LiveThemeStyles}).
 * Using a MutationObserver means the Toaster follows the toggle without prop-drilling from the
 * workbench down through the layout tree.
 */
function useHtmlTheme(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const read = () => {
      const value = root.dataset.theme
      setMode(value === 'light' ? 'light' : 'dark')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, {attributes: true, attributeFilter: ['data-theme']})
    return () => observer.disconnect()
  }, [])
  return mode
}

export function AppProviders({children}: Props) {
  const theme = useHtmlTheme()
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
