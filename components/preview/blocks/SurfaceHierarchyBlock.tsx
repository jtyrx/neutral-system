import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
} from '@/components/preview/blocks/previewSpecimen'
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import {cn} from '@/lib/utils'

const PLANES = [
  {role: 'surface.sunken', label: 'Sunken', surface: 'bg-sunken'},
  {role: 'surface.default', label: 'Default', surface: 'bg-default'},
  {role: 'surface.raised', label: 'Raised', surface: 'bg-raised'},
  {role: 'surface.overlay', label: 'Overlay', surface: 'bg-overlay shadow-overlay'},
] as const

export function SurfaceHierarchyBlock({
  theme,
  inspection,
  onSelectSystem,
}: BlockCaseProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'ladder', role: 'surface.default'},
        {prefix: 'dividers', role: 'border.muted'},
      ]}
    >
      <PreviewBlockCanvas tone="stage">
        <div className="flex flex-col">
          {PLANES.map((plane, index) => (
            <div
              key={plane.role}
              className={cn(
                'flex flex-wrap items-center gap-6 px-8 py-10 sm:px-10',
                plane.surface,
                index > 0 && 'border-t border-hairline',
              )}
            >
              <p className="font-mono text-nano uppercase tracking-[0.12em] text-default">
                {plane.label}
              </p>
              <SemanticTokenAnnotation
                role={plane.role}
                inspection={inspection}
                theme={theme}
                onSelect={onSelectSystem}
              />
            </div>
          ))}
        </div>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
SurfaceHierarchyBlock.displayName = 'SurfaceHierarchyBlock'
