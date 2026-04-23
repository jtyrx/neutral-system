'use client'

import {memo, type ReactNode} from 'react'

import {semanticColorVarName} from '@/lib/neutral-engine/exportFormats'

export type TokenSelectTheme = 'light' | 'darkElevated'

type Props = {
  /** Semantic role id (e.g. `surface.brand`, `text.on`). */
  role: string
  /** Optional override label. Defaults to the CSS variable name. */
  label?: ReactNode
  /** When true and {@link onSelect} is provided, renders as a click target. */
  inspection?: boolean
  /** Theme the annotation was resolved against — passed through to the Inspector. */
  theme?: TokenSelectTheme
  onSelect?: (role: string, theme?: TokenSelectTheme) => void
  className?: string
}

/**
 * Small role annotation shown next to preview UI. Becomes a click-to-inspect button in inspection mode.
 */
function SemanticTokenAnnotationInner({role, label, inspection, theme, onSelect, className = ''}: Props) {
  const text = label ?? `--${semanticColorVarName(role)}`
  const base = 'font-mono text-[0.55rem] text-muted'

  if (inspection && onSelect) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(role, theme)
        }}
        className={`${base} cursor-pointer rounded px-1 py-0.5 transition hover:bg-[var(--ns-chip)] hover:text-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${className}`}
        aria-label={`Inspect ${role}`}
        data-role={role}
      >
        {text}
      </button>
    )
  }

  return (
    <span className={`${base} ${className}`} data-role={role}>
      {text}
    </span>
  )
}

export const SemanticTokenAnnotation = memo(SemanticTokenAnnotationInner)
