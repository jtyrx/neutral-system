'use client'

import {memo, useCallback} from 'react'

type Props = {
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastMode: 'compact' | 'wide'
  onContrastMode: (m: 'compact' | 'wide') => void
  /** Tighter padding for toolbars */
  dense?: boolean
  /** When false, only contrast mapping is shown (e.g. split comparison already shows both themes). */
  showThemeToggle?: boolean
}

/**
 * Shared light/dark + contrast toggles for the live preview (toolbar + theme section).
 */
const THEME_LABEL: Record<'light' | 'dark', string> = {
  light: 'Light',
  dark: 'Dark elevated',
}

function ThemePreviewControlsInner({
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
  dense,
  showThemeToggle = true,
}: Props) {
  const onLight = useCallback(() => onPreviewTheme('light'), [onPreviewTheme])
  const onDark = useCallback(() => onPreviewTheme('dark'), [onPreviewTheme])
  const onCompact = useCallback(() => onContrastMode('compact'), [onContrastMode])
  const onWide = useCallback(() => onContrastMode('wide'), [onContrastMode])

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
      <div className="flex rounded-full border border-white/12 p-0.5">
        <button
          type="button"
          onClick={onCompact}
          className={`rounded-full ${pad} text-xs font-medium capitalize ${
            contrastMode === 'compact' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
          }`}
        >
          compact
        </button>
        <button
          type="button"
          onClick={onWide}
          className={`rounded-full ${pad} text-xs font-medium capitalize ${
            contrastMode === 'wide' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
          }`}
        >
          wide
        </button>
      </div>
    </div>
  )
}

export const ThemePreviewControls = memo(ThemePreviewControlsInner)
