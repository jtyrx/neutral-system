import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function CalloutBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch">
        <div className="flex-1 rounded-md border border-default bg-inverse px-12 py-10">
          <p className="text-nano font-semibold uppercase tracking-wide text-inverse">
            System
          </p>
          <p className="mt-4 text-xs leading-snug text-inverse">
            Policy saved — your workspace will sync on next load.
          </p>
          <Button variant="ghost" size="xs" className="mt-8 text-inverse">
            Dismiss
          </Button>
        </div>
        <div
          id="brand-callout"
          className="flex-1 rounded-md border border-default px-12 py-10"
          style={{backgroundColor: c.brand}}
        >
          <p className="text-nano font-semibold uppercase tracking-wide text-inverse">
            Brand
          </p>
          <p className="mt-4 text-xs leading-snug text-inverse">
            Upgrade to Pro for audit trails and SSO.
          </p>
          <Button variant="ghost" size="xs" className="mt-8 text-inverse">
            Learn more
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>inverse strip</span>
        <SemanticTokenAnnotation role="surface.inverse" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.inverse" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>brand strip</span>
        <SemanticTokenAnnotation role="surface.brand" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.brand" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
CalloutBlock.displayName = 'CalloutBlock'
