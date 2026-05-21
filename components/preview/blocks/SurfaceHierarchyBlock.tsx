import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'

export function SurfaceHierarchyBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="rounded-lg border p-12 sm:p-16" style={{backgroundColor: c.sunken, borderColor: c.bs}}>
      <div className="flex items-center gap-6">
        <p className="text-micro font-semibold uppercase tracking-wide" style={{color: c.tm}}>Sunken</p>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
      <div className="mt-8 rounded-md border p-10" style={{backgroundColor: c.page, borderColor: c.bs}}>
        <div className="flex items-center gap-6">
          <p className="text-micro font-semibold uppercase tracking-wide" style={{color: c.ts}}>Default</p>
          <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </div>
        <div className="mt-8 rounded-md border p-10 shadow-raised" style={{backgroundColor: c.raised, borderColor: c.bd}}>
          <div className="flex items-center gap-6">
            <p className="text-micro font-semibold uppercase tracking-wide" style={{color: c.ts}}>Raised</p>
            <SemanticTokenAnnotation role="surface.raised" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          </div>
          <div className="mt-8 rounded-md border p-10 shadow-overlay" style={{backgroundColor: c.overlay, borderColor: c.bd}}>
            <div className="flex items-center gap-6">
              <p className="text-micro font-semibold uppercase tracking-wide" style={{color: c.td}}>Overlay</p>
              <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
            </div>
            <p className="mt-4 text-micro leading-relaxed" style={{color: c.ts}}>
              Highest elevation — menus, popovers, dialogs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
SurfaceHierarchyBlock.displayName = 'SurfaceHierarchyBlock'
