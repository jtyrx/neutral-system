import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockShell,
  PreviewBlockSplit,
} from '@/components/preview/blocks/previewSpecimen'
import {Button} from '@/components/ui/button.tsx'
import {cn} from '@/lib/utils'

export function CalloutBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'inverse', role: 'surface.inverse'},
        {prefix: 'inverse ink', role: 'text.inverse'},
        {prefix: 'brand plane', role: 'surface.brand'},
        {prefix: 'brand ink', role: 'text.brand'},
      ]}
    >
      <PreviewBlockSplit>
        <div
          className={cn(
            'flex flex-col rounded-control border border-default bg-inverse px-10 py-8 sm:px-12 sm:py-10',
          )}
        >
          <p className="font-mono text-nano uppercase tracking-[0.12em] text-inverse">System</p>
          <p className="mt-4 text-xs leading-snug text-inverse">
            Mapping saved for light and dark elevated themes.
          </p>
          <Button variant="ghost" size="xs" className="mt-6 w-fit text-inverse">
            Dismiss
          </Button>
        </div>

        <div
          className="flex flex-col rounded-control border border-default px-10 py-8 sm:px-12 sm:py-10"
          style={{backgroundColor: c.brand}}
        >
          <p className="font-mono text-nano uppercase tracking-[0.12em] text-inverse">Brand</p>
          <p className="mt-4 text-xs leading-snug text-inverse">
            Brand plane outside the neutral elevation ladder.
          </p>
          <Button variant="ghost" size="xs" className="mt-6 w-fit text-inverse">
            View mapping
          </Button>
        </div>
      </PreviewBlockSplit>
    </PreviewBlockShell>
  )
}
CalloutBlock.displayName = 'CalloutBlock'
