'use client'

import {memo, useCallback} from 'react'

import {GlobalThemeToggleButton} from '@/components/workbench/GlobalThemeToggleButton'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  /** App-wide `html[data-theme]` — same source as {@link LiveThemeStyles}. */
  globalThemeMode: 'light' | 'dark'
  onGlobalThemeMode: (value: 'light' | 'dark', label?: string) => void
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark', label?: string) => void
  contrastEmphasis: ContrastEmphasis
  onContrastEmphasis: (e: ContrastEmphasis, label?: string) => void
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
  globalThemeMode,
  onGlobalThemeMode,
  previewTheme,
  onPreviewTheme,
  contrastEmphasis,
  onContrastEmphasis,
  showContrastPairs,
  onShowContrastPairs,
  dense,
  showThemeToggle = true,
}: Props) {
  const onLight = useCallback(() => onPreviewTheme('light', THEME_LABEL.light), [onPreviewTheme])
  const onDark = useCallback(() => onPreviewTheme('dark', THEME_LABEL.dark), [onPreviewTheme])
  const onSubtle = useCallback(
    () => onContrastEmphasis('subtle', `Contrast · ${EMPHASIS_LABEL.subtle}`),
    [onContrastEmphasis],
  )
  const onDefault = useCallback(
    () => onContrastEmphasis('default', `Contrast · ${EMPHASIS_LABEL.default}`),
    [onContrastEmphasis],
  )
  const onStrong = useCallback(
    () => onContrastEmphasis('strong', `Contrast · ${EMPHASIS_LABEL.strong}`),
    [onContrastEmphasis],
  )
  const onInverse = useCallback(
    () => onContrastEmphasis('inverse', `Contrast · ${EMPHASIS_LABEL.inverse}`),
    [onContrastEmphasis],
  )

  const emphasisHandler: Record<ContrastEmphasis, () => void> = {
    subtle: onSubtle,
    default: onDefault,
    strong: onStrong,
    inverse: onInverse,
  }

  const pad = dense ? 'px-3 py-1' : 'px-4 py-1.5'
  return (
    <div className={`flex flex-wrap items-center gap-2 ${dense ? '' : 'gap-3'}`}>
      <div
        className="flex items-center gap-2 border-r border-[var(--ns-hairline)] pr-2 sm:pr-2.5"
        role="group"
        aria-label="Application color theme"
      >
        <GlobalThemeToggleButton mode={globalThemeMode} onChange={onGlobalThemeMode} />
      </div>
      {showThemeToggle ? (
        <div
          className="flex rounded-full border border-[var(--ns-hairline)] p-0.5"
          role="group"
          aria-label="Preview focus theme"
        >
          <button
            type="button"
            onClick={onLight}
            className={`rounded-full ${pad} text-xs font-medium ${
              previewTheme === 'light' ? 'bg-[var(--ns-overlay-strong)] text-[var(--ns-text)]' : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text)]'
            }`}
          >
            {THEME_LABEL.light}
          </button>
          <button
            type="button"
            onClick={onDark}
            className={`rounded-full ${pad} text-xs font-medium ${
              previewTheme === 'dark' ? 'bg-[var(--ns-overlay-strong)] text-[var(--ns-text)]' : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text)]'
            }`}
          >
            {THEME_LABEL.dark}
          </button>
        </div>
      ) : null}
      {onShowContrastPairs ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--ns-text-subtle)]">
          <input
            type="checkbox"
            className="rounded border-[var(--ns-hairline-strong)] bg-[var(--ns-surface-raised)]"
            checked={showContrastPairs ?? false}
            onChange={(e) => onShowContrastPairs(e.target.checked)}
          />
          Contrast pairs
        </label>
      ) : null}
      <div className="flex flex-wrap rounded-full border border-[var(--ns-hairline)] p-0.5">
        {EMPHASIS_ORDER.map((e) => (
          <button
            key={e}
            type="button"
            onClick={emphasisHandler[e]}
            className={`rounded-full ${pad} text-xs font-medium capitalize ${
              contrastEmphasis === e ? 'bg-[var(--ns-overlay-strong)] text-[var(--ns-text)]' : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text)]'
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
