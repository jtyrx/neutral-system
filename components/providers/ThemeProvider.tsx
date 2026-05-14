'use client'

import {ThemeProvider as NextThemesProvider} from 'next-themes'
import type {ComponentProps} from 'react'

let suppressedNextThemesScriptWarning = false

/**
 * `next-themes` injects an inline `<script>` for FOUC prevention. React 19 surfaces a dev
 * console message for `<script>` rendered inside a client tree — behavior is intentional on
 * their side; the script still runs during SSR. Filter that single noise line in development.
 */
function suppressReact19NextThemesScriptNoise() {
  if (
    suppressedNextThemesScriptWarning ||
    typeof window === 'undefined' ||
    process.env.NODE_ENV === 'production'
  ) {
    return
  }
  suppressedNextThemesScriptWarning = true
  const orig = console.error
  console.error = (...args: unknown[]) => {
    const first = args[0]
    if (
      typeof first === 'string' &&
      (first.includes('Encountered a script tag while rendering React component') ||
        first.includes('Consider using template tag instead'))
    ) {
      return
    }
    orig.apply(console, args)
  }
}

suppressReact19NextThemesScriptNoise()

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
