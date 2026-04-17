'use client'

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

export function ThemePreviewControls({
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
  dense,
  showThemeToggle = true,
}: Props) {
  const pad = dense ? 'px-3 py-1' : 'px-4 py-1.5'
  return (
    <div className={`flex flex-wrap items-center gap-2 ${dense ? '' : 'gap-3'}`}>
      {showThemeToggle ? (
        <div
          className="flex rounded-full border border-white/12 p-0.5"
          role="group"
          aria-label="Mock UI and focus comparison theme"
        >
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPreviewTheme(t)}
              className={`rounded-full ${pad} text-xs font-medium ${
                previewTheme === t ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
              }`}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex rounded-full border border-white/12 p-0.5">
        {(['compact', 'wide'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onContrastMode(m)}
            className={`rounded-full ${pad} text-xs font-medium capitalize ${
              contrastMode === m ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
