'use client'

import type {ReactNode} from 'react'

type Theme = 'light' | 'dark'

type Props = {
  theme: Theme
  label: string
  children: ReactNode
}

const ACCENT: Record<Theme, {dot: string; text: string}> = {
  light: {
    dot: 'bg-[var(--chrome-amber-fill)]',
    text: 'text-[var(--chrome-amber-text)]',
  },
  dark: {
    dot: 'bg-[var(--chrome-sky-fill)]',
    text: 'text-[var(--chrome-sky-text)]',
  },
}

/**
 * Frames one theme rendering of a preview block with a small labeled pill, used inside Split comparison.
 */
export function ThemeComparisonFrame({theme, label, children}: Props) {
  const accent = ACCENT[theme]
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span className={`text-[0.55rem] font-semibold uppercase tracking-[0.16em] ${accent.text}`}>{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
