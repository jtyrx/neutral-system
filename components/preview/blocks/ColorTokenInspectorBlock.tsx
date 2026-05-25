'use client'

import {useMemo} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip.tsx'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

export function ColorTokenInspectorBlock({tokenView, theme, inspection, onSelectSystem}: BlockCaseProps) {
  const surfaceTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'surface'), [tokenView])
  const borderTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'border'), [tokenView])
  const textTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'text'), [tokenView])

  const rows = [
    {label: 'Surface', tokens: surfaceTokens},
    {label: 'Border', tokens: borderTokens},
    {label: 'Text', tokens: textTokens},
  ]

  return (
    <TooltipProvider>
      <div className="space-y-12 rounded-lg border border-subtle bg-default p-12">
        {rows.map(({label, tokens}) => (
          <div key={label}>
            <p className="mb-6 text-micro font-medium uppercase tracking-wide text-muted">{label}</p>
            <div className="flex flex-wrap gap-6">
              {tokens.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="h-28 w-28 rounded-full border-2 border-hairline-strong shadow-inner transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          </div>
        ))}
        {inspection ? null : (
          <p className="text-nano text-white/45">Click a swatch to inspect its token</p>
        )}
      </div>
    </TooltipProvider>
  )
}
ColorTokenInspectorBlock.displayName = 'ColorTokenInspectorBlock'
