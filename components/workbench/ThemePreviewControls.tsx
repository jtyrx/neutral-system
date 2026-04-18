'use client'

import {memo, useCallback} from 'react'

import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastEmphasis: ContrastEmphasis
  onContrastEmphasis: (e: ContrastEmphasis) => void
  showContrastPairs?: boolean
  onShowContrastPairs?: (v: boolean) => void
  /** Tighter padding for toolbars */
  dense?: boolean
  /** When false, only contrast mapping is shown (e.g. split comparison already shows both themes). */
  showThemeToggle?: boolean
}

const THEME_LABEL: Record<'light' | 'dark', string> = {
  light: 'Light',
  dark: 'Dark elevated',
}

const EMPHASIS_ORDER: ContrastEmphasis[] = ['subtle', 'default', 'strong', 'inverse']

const EMPHASIS_LABEL: Record<ContrastEmphasis, string> = {
  subtle: 'Subtle',
  default: 'Default',
  strong: 'Strong',
  inverse: 'Inverse',
}

function ThemePreviewControlsInner({
  previewTheme,
  onPreviewTheme,
  contrastEmphasis,
  onContrastEmphasis,
  showContrastPairs,
  onShowContrastPairs,
  dense,
  showThemeToggle = true,
}: Props) {
  const onLight = useCallback(() => onPreviewTheme('light'), [onPreviewTheme])
  const onDark = useCallback(() => onPreviewTheme('dark'), [onPreviewTheme])
  const onSubtle = useCallback(() => onContrastEmphasis('subtle'), [onContrastEmphasis])
  const onDefault = useCallback(() => onContrastEmphasis('default'), [onContrastEmphasis])
  const onStrong = useCallback(() => onContrastEmphasis('strong'), [onContrastEmphasis])
  const onInverse = useCallback(() => onContrastEmphasis('inverse'), [onContrastEmphasis])

  const emphasisHandler: Record<ContrastEmphasis, () => void> = {
    subtle: onSubtle,
    default: onDefault,
    strong: onStrong,
    inverse: onInverse,
  }

  const pad = dense ? 'px-3 py-1' : 'px-4 py-1.5'
  return (
    <div className={`flex flex-wrap items-center gap-2 ${dense ? '' : 'gap-3'}`}>
      {showThemeToggle ? (
        <div
          className="flex rounded-full border border-white/12 p-0.5"
          role="group"
          aria-label="Mock UI and focus comparison theme"
        >
          <button
            type="button"
            onClick={onLight}
            className={`rounded-full ${pad} text-xs font-medium ${
              previewTheme === 'light' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {THEME_LABEL.light}
          </button>
          <button
            type="button"
            onClick={onDark}
            className={`rounded-full ${pad} text-xs font-medium ${
              previewTheme === 'dark' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {THEME_LABEL.dark}
          </button>
        </div>
      ) : null}
      {onShowContrastPairs ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            className="rounded border-white/20 bg-black/40"
            checked={showContrastPairs ?? false}
            onChange={(e) => onShowContrastPairs(e.target.checked)}
          />
          Contrast pairs
        </label>
      ) : null}
      <div className="flex flex-wrap rounded-full border border-white/12 p-0.5">
        {EMPHASIS_ORDER.map((e) => (
          <button
            key={e}
            type="button"
            onClick={emphasisHandler[e]}
            className={`rounded-full ${pad} text-xs font-medium capitalize ${
              contrastEmphasis === e ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
            }`}
            aria-pressed={contrastEmphasis === e}
          >
            {EMPHASIS_LABEL[e]}
          </button>
        ))}
      </div>
    </div>
  )
}

export const ThemePreviewControls = memo(ThemePreviewControlsInner)
