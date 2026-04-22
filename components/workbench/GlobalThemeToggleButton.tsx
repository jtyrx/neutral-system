'use client'

import {memo, useCallback} from 'react'

type ThemeMode = 'light' | 'dark'

function IconSun({className}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={true}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v1.75M12 20.25V22M4.22 4.22l1.24 1.24M18.54 18.54l1.24 1.24M2 12h1.75M20.25 12H22M4.22 19.78l1.24-1.24M18.54 5.46l1.24-1.24" />
    </svg>
  )
}

function IconMoon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={true}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

const ICON = 'h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]'

/**
 * App-wide light/dark toggle (same state as {@link ../providers/LiveThemeStyles} / `html[data-theme]`).
 * Toolbar-sized for embedding in {@link ThemePreviewControls}.
 */
function GlobalThemeToggleButtonInner({
  mode,
  onChange,
  className,
}: {
  mode: ThemeMode
  onChange: (value: ThemeMode, label?: string) => void
  className?: string
}) {
  const next: ThemeMode = mode === 'light' ? 'dark' : 'light'
  const toggle = useCallback(() => {
    onChange(next, next === 'light' ? 'Theme · Light' : 'Theme · Dark')
  }, [onChange, next])

  const label =
    mode === 'light'
      ? 'App color theme: light. Activate to switch to dark mode.'
      : 'App color theme: dark. Activate to switch to light mode.'

  return (
    <button
      type="button"
      data-ns-theme-toggle
      onClick={toggle}
      aria-label={label}
      title={mode === 'light' ? 'Switch app to dark theme' : 'Switch app to light theme'}
      className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--ns-hairline-strong)] bg-[var(--ns-surface-overlay)] text-[var(--ns-text)] shadow-sm transition-[color,background-color,transform,box-shadow] duration-150 ease-out hover:bg-[var(--ns-chip)] hover:shadow-md active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ns-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ns-app-bg)] motion-reduce:transition-none motion-reduce:active:scale-100 sm:size-9 ${className ?? ''}`}
    >
      {mode === 'light' ? <IconSun className={ICON} /> : <IconMoon className={ICON} />}
    </button>
  )
}

export const GlobalThemeToggleButton = memo(GlobalThemeToggleButtonInner)
