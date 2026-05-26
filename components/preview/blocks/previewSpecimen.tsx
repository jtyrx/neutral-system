import type {CSSProperties, ReactNode} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {cn} from '@/lib/utils'

export type PreviewCanvasTone = 'bordered' | 'flush' | 'stage'

const CANVAS_TONE: Record<PreviewCanvasTone, string> = {
  bordered: 'rounded-control border border-hairline bg-default p-10 sm:p-12',
  flush: 'bg-default',
  stage: 'rounded-control bg-sunken p-8 sm:p-10',
}

export function PreviewBlockCanvas({
  children,
  className,
  style,
  tone = 'bordered',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  tone?: PreviewCanvasTone
}) {
  return (
    <div className={cn(CANVAS_TONE[tone], className)} style={style}>
      {children}
    </div>
  )
}
PreviewBlockCanvas.displayName = 'PreviewBlockCanvas'

export function PreviewBlockSplit({
  children,
  className,
  aside = 'equal',
}: {
  children: ReactNode
  className?: string
  aside?: 'equal' | 'wide-main'
}) {
  return (
    <div
      className={cn(
        'grid gap-10 lg:gap-12',
        aside === 'wide-main'
          ? 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]'
          : 'lg:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
PreviewBlockSplit.displayName = 'PreviewBlockSplit'

export const previewSectionRule = 'border-t border-hairline pt-10 lg:pt-12'

export function PreviewSpecimenStack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-8', className)}>{children}</div>
}
PreviewSpecimenStack.displayName = 'PreviewSpecimenStack'

export function PreviewSpecimen({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-6', className)}>
      <p className="font-mono text-nano uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="flex min-h-0 flex-col justify-center">{children}</div>
    </div>
  )
}
PreviewSpecimen.displayName = 'PreviewSpecimen'

export function PreviewSpecimenRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-6', className)}>
      {children}
    </div>
  )
}
PreviewSpecimenRow.displayName = 'PreviewSpecimenRow'

export type PreviewTokenFootnote = {
  prefix: string
  role: string
}

export function PreviewBlockShell({
  children,
  footnotes,
  theme,
  inspection,
  onSelectSystem,
}: Pick<BlockCaseProps, 'theme' | 'inspection' | 'onSelectSystem'> & {
  children: ReactNode
  footnotes: PreviewTokenFootnote[]
}) {
  return (
    <div className="space-y-8">
      {children}
      <PreviewTokenFootnotes
        theme={theme}
        inspection={inspection}
        onSelectSystem={onSelectSystem}
        items={footnotes}
      />
    </div>
  )
}
PreviewBlockShell.displayName = 'PreviewBlockShell'

export function PreviewTokenFootnotes({
  items,
  theme,
  inspection,
  onSelectSystem,
  className,
}: Pick<BlockCaseProps, 'theme' | 'inspection' | 'onSelectSystem'> & {
  items: PreviewTokenFootnote[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-hairline pt-8 text-nano text-muted',
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={`${item.role}-${index}`} className="contents">
          {index > 0 ? <span aria-hidden>·</span> : null}
          <span>{item.prefix}</span>
          <SemanticTokenAnnotation
            role={item.role}
            inspection={inspection}
            theme={theme}
            onSelect={onSelectSystem}
          />
        </span>
      ))}
    </div>
  )
}
PreviewTokenFootnotes.displayName = 'PreviewTokenFootnotes'

export function PreviewKbd({children}: {children: ReactNode}) {
  return (
    <kbd className="inline-flex h-20 min-w-20 items-center justify-center rounded-sm border border-hairline bg-raised px-6 font-mono text-nano text-subtle shadow-raised">
      {children}
    </kbd>
  )
}
PreviewKbd.displayName = 'PreviewKbd'
