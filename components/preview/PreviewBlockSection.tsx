import type {ReactNode} from 'react'

import {Button} from '@/components/ui/button.tsx'
import {cn} from '@/lib/cn'

type Props = {
  index: number
  eyebrow: string
  title: string
  intent: string
  children: ReactNode
  className?: string
  /** Block id — passed to onChainSelect when the token chain button is clicked */
  blockId?: string | undefined
  /** Whether this block has a chainSpec — controls disabled state of the button */
  hasChainSpec?: boolean | undefined
  /** Called when user clicks the "Token chain" button */
  onChainSelect?: ((blockId: string) => void) | undefined
}

/**
 * Section shell shared by every preview block — provides consistent heading, purpose line, and rhythm.
 * Does not render theme columns itself; the content is supplied by the caller (single or paired).
 */
export function PreviewBlockSection({index, eyebrow, title, intent, children, className, blockId, hasChainSpec, onChainSelect}: Props) {
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
        <div className="flex items-start justify-between gap-8">
          <div className="flex flex-col gap-4 min-w-0">
            <h3 id={`preview-block-${index}-title`} className="text-sm font-semibold tracking-tight text-default">
              {title}
            </h3>
            <p className="text-xs leading-snug text-muted">{intent}</p>
          </div>
          {blockId != null && onChainSelect != null && (
            <Button
              variant="outline"
              size="xs"
              disabled={!hasChainSpec}
              onClick={() => onChainSelect(blockId)}
              className="shrink-0 font-mono uppercase tracking-[0.12em]"
            >
              Token chain
            </Button>
          )}
        </div>
      </header>
      {children}
    </section>
  )
}
PreviewBlockSection.displayName = 'PreviewBlockSection'
