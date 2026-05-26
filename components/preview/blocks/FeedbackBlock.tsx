import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
  PreviewBlockSplit,
  PreviewSpecimen,
  PreviewSpecimenRow,
  previewSectionRule,
} from '@/components/preview/blocks/previewSpecimen'
import {Badge} from '@/components/ui/badge.tsx'
import {Button} from '@/components/ui/button.tsx'
import {Skeleton} from '@/components/ui/skeleton.tsx'

const BADGE_VARIANTS = [
  {variant: 'default' as const, label: 'Default'},
  {variant: 'subtle' as const, label: 'Subtle'},
  {variant: 'outline' as const, label: 'Outline'},
  {variant: 'solid' as const, label: 'Solid'},
  {variant: 'destructive' as const, label: 'Destructive'},
  {variant: 'disabled' as const, label: 'Disabled'},
] as const

export function FeedbackBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'badge fill', role: 'surface.raised'},
        {prefix: 'toast plane', role: 'surface.overlay'},
        {prefix: 'skeleton', role: 'surface.subtle'},
      ]}
    >
      <PreviewBlockCanvas>
        <PreviewSpecimen label="Badge">
          <PreviewSpecimenRow>
            {BADGE_VARIANTS.map(({variant, label}) => (
              <Badge key={variant} variant={variant}>
                {label}
              </Badge>
            ))}
            <Badge variant="brand" style={{backgroundColor: c.brand}} className="text-on">
              Brand
            </Badge>
          </PreviewSpecimenRow>
        </PreviewSpecimen>

        <PreviewBlockSplit className={previewSectionRule}>
          <PreviewSpecimen label="Skeleton">
            <div className="max-w-xs space-y-4">
              <Skeleton className="h-12 w-3/5" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-11/12" />
            </div>
          </PreviewSpecimen>
          <PreviewSpecimen label="Toast">
            <div className="flex w-full max-w-sm items-start justify-between gap-8 rounded-control border border-default bg-overlay px-10 py-8 shadow-overlay">
              <div className="min-w-0">
                <p className="text-xs font-medium text-default">Export ready</p>
                <p className="mt-2 text-micro text-subtle">Theme copied to clipboard.</p>
              </div>
              <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted" aria-label="Dismiss">
                ×
              </Button>
            </div>
          </PreviewSpecimen>
        </PreviewBlockSplit>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
FeedbackBlock.displayName = 'FeedbackBlock'
