import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockShell,
  PreviewBlockSplit,
  PreviewSpecimen,
} from '@/components/preview/blocks/previewSpecimen'
import {Button} from '@/components/ui/button.tsx'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'

export function DataCardBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'card surface', role: 'surface.raised'},
        {prefix: 'card border', role: 'border.default'},
        {prefix: 'footer well', role: 'surface.subtle'},
      ]}
    >
      <PreviewBlockSplit aside="wide-main">
        <PreviewSpecimen label="Structured">
          <Card size="sm" className="w-full border-default bg-raised shadow-raised">
            <CardHeader>
              <CardTitle>Semantic mapping</CardTitle>
              <CardAction>
                <Button variant="outline" size="xs">
                  Inspect
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 font-mono text-nano tabular-nums">
                <dt className="text-muted">surface.default</dt>
                <dd className="text-default">neutral-12</dd>
                <dt className="text-muted">text.muted</dt>
                <dd className="text-default">neutral-18</dd>
                <dt className="text-muted">border.focus</dt>
                <dd className="text-default">derived</dd>
              </dl>
            </CardContent>
            <CardFooter className="justify-end gap-6">
              <Button variant="ghost" size="sm">
                Reset
              </Button>
              <Button variant="default" size="sm">
                Apply
              </Button>
            </CardFooter>
          </Card>
        </PreviewSpecimen>

        <PreviewSpecimen label="Compact">
          <Card size="sm" className="w-full border-default bg-default">
            <CardHeader className="pb-0">
              <CardTitle className="text-xs">Export format</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-micro leading-relaxed text-subtle">
                CSS variables, JSON, or Tailwind v4 inline theme.
              </p>
            </CardContent>
          </Card>
        </PreviewSpecimen>
      </PreviewBlockSplit>
    </PreviewBlockShell>
  )
}
DataCardBlock.displayName = 'DataCardBlock'
