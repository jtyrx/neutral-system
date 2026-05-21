import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'

export function SurfaceHierarchyBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <div className="rounded-lg border border-subtle bg-sunken p-12 sm:p-16">
      <div className="flex items-center gap-6">
        <p className="text-micro font-semibold uppercase tracking-wide text-muted">Sunken</p>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
      <div className="mt-8 rounded-md border border-subtle bg-default p-10">
        <div className="flex items-center gap-6">
          <p className="text-micro font-semibold uppercase tracking-wide text-subtle">Default</p>
          <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </div>
        <div className="mt-8 rounded-md border border-default bg-raised p-10 shadow-raised">
          <div className="flex items-center gap-6">
            <p className="text-micro font-semibold uppercase tracking-wide text-subtle">Raised</p>
            <SemanticTokenAnnotation role="surface.raised" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          </div>
          <div className="mt-8 rounded-md border border-default bg-overlay p-10 shadow-overlay">
            <div className="flex items-center gap-6">
              <p className="text-micro font-semibold uppercase tracking-wide text-default">Overlay</p>
              <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
            </div>
            <p className="mt-4 text-micro leading-relaxed text-subtle">
              Highest elevation — menus, popovers, dialogs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
SurfaceHierarchyBlock.displayName = 'SurfaceHierarchyBlock'
