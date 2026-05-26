import type {ReactNode} from 'react'

import {Button} from '@/components/ui/button.tsx'
import {cn} from '@/lib/cn'
import type {PreviewBlockSectionLayout} from '@/components/preview/previewBlockSectionLayout'
import {
  previewSectionAlignClass,
  previewSectionHeaderContentGapClass,
  previewSectionShellClass,
  previewSectionWidthClass,
  resolvePreviewBlockSectionLayout,
} from '@/components/preview/previewBlockSectionLayout'

type Props = {
  index: number
  eyebrow: string
  title: string
  intent: string
  children: ReactNode
  className?: string
  layout?: PreviewBlockSectionLayout
  blockId?: string | undefined
  hasChainSpec?: boolean | undefined
  onChainSelect?: ((blockId: string) => void) | undefined
}

/**
 * Section shell shared by every preview block — heading, purpose line, and layout slot.
 * Per-block layout comes from `PreviewBlockCase.sectionLayout` in the registry.
 */
export function PreviewBlockSection({
  index,
  eyebrow,
  title,
  intent,
  children,
  className,
  layout,
  blockId,
  hasChainSpec,
  onChainSelect,
}: Props) {
  const resolved = resolvePreviewBlockSectionLayout(layout)

  return (
    <section
      aria-labelledby={`preview-block-${index}-title`}
      className={cn(
        previewSectionShellClass(resolved.shell),
        previewSectionHeaderContentGapClass(resolved.headerContentGap),
        previewSectionWidthClass(resolved.sectionWidth),
        previewSectionAlignClass(resolved.sectionAlign),
        resolved.sectionClassName,
        className,
      )}
    >
      <header className="flex flex-col gap-4 border-b border-hairline pb-12">
        <div className="flex items-center gap-8 font-mono text-nano font-medium uppercase tracking-[0.14em] text-muted">
          <span className="tabular-nums">{String(index).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-16 bg-overlay-strong" />
          <span>{eyebrow}</span>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-4">
            <h3
              id={`preview-block-${index}-title`}
              className="text-sm font-semibold tracking-tight text-default"
            >
              {title}
            </h3>
            <p className="text-xs leading-snug text-muted">{intent}</p>
          </div>
          {blockId != null && onChainSelect != null ? (
            <Button
              variant="outline"
              size="xs"
              disabled={!hasChainSpec}
              onClick={() => onChainSelect(blockId)}
              className="shrink-0 font-mono uppercase tracking-[0.12em]"
            >
              Token chain
            </Button>
          ) : null}
        </div>
      </header>
      <div className={cn('min-w-0', resolved.contentClassName)}>{children}</div>
    </section>
  )
}
PreviewBlockSection.displayName = 'PreviewBlockSection'
