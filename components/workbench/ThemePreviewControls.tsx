'use client'

import {memo, useCallback} from 'react'

import {GlobalThemeToggleButton} from '@/components/workbench/GlobalThemeToggleButton'
import {cn} from '@/lib/cn'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
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
    <div className={cn('flex flex-wrap items-center gap-2', !dense && 'gap-3')}>
      <div
        className="flex items-center gap-2 border-r border-(--ns-hairline) pr-2 sm:pr-2.5"
        role="group"
        aria-label="Application color theme"
      >
        <GlobalThemeToggleButton />
      </div>
      {showThemeToggle ? (
        <div
          className="ns-control-group"
          role="group"
          aria-label="Preview focus theme"
        >
          <button
            type="button"
            onClick={onLight}
            className={cn(
              'ns-control-item text-xs',
              pad,
              previewTheme === 'light'
                ? 'bg-(--ns-overlay-strong) text-(--ns-text)'
                : 'text-(--ns-text-muted) hover:text-(--ns-text)',
            )}
          >
            {THEME_LABEL.light}
          </button>
          <button
            type="button"
            onClick={onDark}
            className={cn(
              'ns-control-item text-xs',
              pad,
              previewTheme === 'dark'
                ? 'bg-(--ns-overlay-strong) text-(--ns-text)'
                : 'text-(--ns-text-muted) hover:text-(--ns-text)',
            )}
          >
            {THEME_LABEL.dark}
          </button>
        </div>
      ) : null}
      {onShowContrastPairs ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-(--ns-text-subtle)">
          <input
            type="checkbox"
            className="rounded border-(--ns-hairline-strong) bg-(--ns-surface-raised)"
            checked={showContrastPairs ?? false}
            onChange={(e) => onShowContrastPairs(e.target.checked)}
          />
          Contrast pairs
        </label>
      ) : null}
      <div className="ns-control-group">
        {EMPHASIS_ORDER.map((e) => (
          <button
            key={e}
            type="button"
            onClick={emphasisHandler[e]}
            className={cn(
              'ns-control-item text-xs capitalize',
              pad,
              contrastEmphasis === e
                ? 'bg-(--ns-overlay-strong) text-(--ns-text)'
                : 'text-(--ns-text-muted) hover:text-(--ns-text)',
            )}
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
