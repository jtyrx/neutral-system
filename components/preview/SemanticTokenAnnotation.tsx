'use client'

import {memo, type ReactNode} from 'react'

import {semanticColorVarName} from '@/lib/neutral-engine/exportFormats'
import {cn} from '@/lib/cn'

export type TokenSelectTheme = 'light' | 'darkElevated'

type Props = {
  /** Semantic role id (e.g. `surface.brand`, `text.inverse`). */
  role: string
  /** Optional override label. Defaults to the CSS variable name. */
  label?: ReactNode | undefined
  /** When true and {@link onSelect} is provided, renders as a click target. */
  inspection?: boolean | undefined
  /** Theme the annotation was resolved against — passed through to the Inspector. */
  theme?: TokenSelectTheme | undefined
  onSelect?: ((role: string, theme?: TokenSelectTheme) => void) | undefined
  className?: string | undefined
}

/**
 * Small role annotation shown next to preview UI. Becomes a click-to-inspect button in inspection mode.
 */
function SemanticTokenAnnotationInner({role, label, inspection, theme, onSelect, className = ''}: Props) {
  const text = label ?? `--${semanticColorVarName(role)}`
  const base = 'font-mono text-nano text-muted'

  if (inspection && onSelect) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(role, theme)
        }}
        className={cn(base, 'cursor-pointer rounded px-4 py-2 transition hover:bg-chip hover:text-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-border-focus)', className)}
        aria-label={`Inspect ${role}`}
        data-role={role}
      >
        {text}
      </button>
    )
  }

  return (
    <span className={cn(base, className)} data-role={role}>
      {text}
    </span>
  )
}

export const SemanticTokenAnnotation = memo(SemanticTokenAnnotationInner)
SemanticTokenAnnotation.displayName = 'SemanticTokenAnnotation'
