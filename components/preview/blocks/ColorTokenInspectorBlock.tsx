'use client'

import {useMemo} from 'react'

import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockShell,
  PreviewSpecimen,
  previewSectionRule,
} from '@/components/preview/blocks/previewSpecimen'
import {cn} from '@/lib/utils'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip.tsx'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

export function ColorTokenInspectorBlock({
  tokenView,
  theme,
  inspection,
  onSelectSystem,
}: BlockCaseProps) {
  const layers = useMemo(
    () =>
      (['surface', 'border', 'text'] as const).map((layer) => ({
        label: layer.charAt(0).toUpperCase() + layer.slice(1),
        tokens: tokensForSemanticLayerPublic(tokenView, layer),
      })),
    [tokenView],
  )

  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'swatches', role: 'surface.default'},
        {prefix: 'borders', role: 'border.default'},
        {prefix: 'text roles', role: 'text.default'},
      ]}
    >
      <TooltipProvider>
        <div className="flex flex-col">
          {layers.map(({label, tokens}, index) => (
          <PreviewSpecimen
            key={label}
            label={label}
            className={cn(index > 0 && previewSectionRule)}
          >
            <div className="flex flex-wrap gap-4">
              {tokens.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="size-28 rounded-full border-2 border-hairline-strong shadow-inner transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      style={{backgroundColor: t.serialized.hex}}
                      onClick={() => onSelectSystem?.(t.role, theme)}
                      aria-label={t.role}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-mono text-micro">{t.name}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </PreviewSpecimen>
          ))}
        </div>
      </TooltipProvider>
    </PreviewBlockShell>
  )
}
ColorTokenInspectorBlock.displayName = 'ColorTokenInspectorBlock'
