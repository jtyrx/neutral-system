'use client'

import type {ReactNode} from 'react'

type Props = {
  index: number
  eyebrow: string
  title: string
  intent: string
  children: ReactNode
}

/**
 * Section shell shared by every preview block — provides consistent heading, purpose line, and rhythm.
 * Does not render theme columns itself; the content is supplied by the caller (single or paired).
 */
export function PreviewBlockSection({index, eyebrow, title, intent, children}: Props) {
  return (
    <section
      aria-labelledby={`preview-block-${index}-title`}
      className="ns-overlay-card space-y-3"
    >
      <header className="flex flex-col gap-1 border-b border-(--ns-hairline) pb-3">
        <div className="flex items-center gap-2 text-[0.6rem] font-medium font-mono uppercase tracking-[0.14em] text-(--ns-text-muted)">
          <span className="tabular-nums">{String(index).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-4 bg-(--ns-overlay-strong)" />
          <span>{eyebrow}</span>
        </div>
        <h3 id={`preview-block-${index}-title`} className="text-sm font-semibold tracking-tight text-(--ns-text)">
          {title}
        </h3>
        <p className="text-[0.7rem] leading-snug text-(--ns-text-muted)">{intent}</p>
      </header>
      {children}
    </section>
  )
}
