import type {ReactNode} from 'react'

import {cn} from '@/lib/cn'

type Props = {
  index: number
  eyebrow: string
  title: string
  intent: string
  children: ReactNode
  className?: string
}

/**
 * Section shell shared by every preview block — provides consistent heading, purpose line, and rhythm.
 * Does not render theme columns itself; the content is supplied by the caller (single or paired).
 */
export function PreviewBlockSection({index, eyebrow, title, intent, children, className}: Props) {
  return (
    <section
      aria-labelledby={`preview-block-${index}-title`}
      className={cn('ns-overlay-card space-y-12', className)}
    >
      <header className="flex flex-col gap-4 border-b border-hairline pb-12">
        <div className="flex items-center gap-8 text-nano font-medium font-mono uppercase tracking-[0.14em] text-muted">
          <span className="tabular-nums">{String(index).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-16 bg-overlay-strong" />
          <span>{eyebrow}</span>
        </div>
        <h3 id={`preview-block-${index}-title`} className="text-sm font-semibold tracking-tight text-default">
          {title}
        </h3>
        <p className="text-xs leading-snug text-muted">{intent}</p>
      </header>
      {children}
    </section>
  )
}
PreviewBlockSection.displayName = 'PreviewBlockSection'
