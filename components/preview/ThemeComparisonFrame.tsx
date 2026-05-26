import type {CSSProperties, ReactNode} from 'react'

import {cn} from '@/lib/cn'

type Theme = 'light' | 'dark'

type Props = {
  theme: Theme
  label: string
  children: ReactNode
  themeVars?: CSSProperties | undefined
  className?: string
  contentClassName?: string
  showLabel?: boolean
}

const ACCENT = {
  light: {
    dot: 'bg-(--chrome-amber-fill)',
    text: 'text-(--chrome-amber-text)',
  },
  dark: {
    dot: 'bg-(--chrome-sky-fill)',
    text: 'text-(--chrome-sky-text)',
  },
} satisfies Record<Theme, {dot: string; text: string}>

/**
 * Frames one theme rendering of a preview block with a small labeled pill, used inside Split comparison.
 */
export function ThemeComparisonFrame({
  theme,
  label,
  children,
  themeVars,
  className,
  contentClassName,
  showLabel = true,
}: Props) {
  const accent = ACCENT[theme]
  return (
    <div
      className={cn('flex min-w-0 flex-col gap-8', className)}
      data-preview-theme={theme}
      style={themeVars}
    >
      {showLabel ? (
        <div className="flex items-center gap-6">
          <span aria-hidden className={cn('h-6 w-6 rounded-full', accent.dot)} />
          <span className={cn('text-nano font-semibold uppercase tracking-[0.16em]', accent.text)}>
            {label}
          </span>
        </div>
      ) : null}
      <div className={cn('min-w-0', contentClassName)}>{children}</div>
    </div>
  )
}
ThemeComparisonFrame.displayName = 'ThemeComparisonFrame'
