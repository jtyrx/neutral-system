import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function DataCardBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <div className="space-y-8">
      <div
        className="rounded-lg border border-default bg-raised p-12 sm:p-16"
        style={{boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 14px 30px rgba(0,0,0,0.12)'}}
      >
        <div className="flex flex-wrap items-start justify-between gap-8">
          <h4 className="text-sm font-semibold text-default">
            Active users
          </h4>
          <span className="text-micro tabular-nums text-muted">
            Updated 14:02 UTC
          </span>
        </div>
        <p className="mt-12 text-2xl font-semibold tabular-nums tracking-tight text-default">
          12.4k
        </p>
        <Button variant="outline" size="sm" className="mt-16">
          View breakdown
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>card surface</span>
        <SemanticTokenAnnotation role="surface.raised" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>control edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>focus ring</span>
        <SemanticTokenAnnotation role="border.focus" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
DataCardBlock.displayName = 'DataCardBlock'
