import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function CalloutBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch">
        <div className="flex-1 rounded-md border px-12 py-10" style={{backgroundColor: c.inverse, borderColor: c.bd}}>
          <p className="text-nano font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            System
          </p>
          <p className="mt-4 text-xs leading-snug" style={{color: c.ton}}>
            Policy saved — your workspace will sync on next load.
          </p>
          <Button variant="ghost" size="xs" className="mt-8" style={{color: c.ton}}>
            Dismiss
          </Button>
        </div>
        <div
          id="brand-callout"
          className="flex-1 rounded-md border px-12 py-10"
          style={{backgroundColor: c.brand, borderColor: c.bd}}
        >
          <p className="text-nano font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            Brand
          </p>
          <p className="mt-4 text-xs leading-snug" style={{color: c.ton}}>
            Upgrade to Pro for audit trails and SSO.
          </p>
          <Button variant="ghost" size="xs" className="mt-8" style={{color: c.ton}}>
            Learn more
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>inverse strip</span>
        <SemanticTokenAnnotation role="surface.inverse" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>brand strip</span>
        <SemanticTokenAnnotation role="surface.brand" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
CalloutBlock.displayName = 'CalloutBlock'
