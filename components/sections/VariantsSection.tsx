'use client'

import {memo} from 'react'

import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group.tsx'
import {logPresetGroup, presetDebugEnabled} from '@/lib/debug/presetDebug'
import {applyVariantToConfig, VARIANT_PRESETS} from '@/lib/neutral-engine/variants'
import type {GlobalScaleConfig, NeutralVariantId} from '@/lib/neutral-engine/types'

type Props = {
  config: GlobalScaleConfig
  /** Optional short label for loading toast (e.g. variant preset name). */
  onChange: (next: GlobalScaleConfig, label?: string) => void
}

function diffConfig(prev: GlobalScaleConfig, next: GlobalScaleConfig) {
  // Only include fields that actually change — keeps logs readable and highlights what the preset did.
  const changed: Record<string, [unknown, unknown]> = {}
  const keys: Array<keyof GlobalScaleConfig> = [
    'variantId',
    'hue',
    'baseChroma',
    'chromaMode',
    'steps',
    'lHigh',
    'lLow',
    'namingStyle',
  ]
  for (const k of keys) {
    if (prev[k] !== next[k]) changed[k] = [prev[k], next[k]]
  }
  return changed
}

function VariantsSectionInner({config, onChange}: Props) {
  return (
    <section id="variants" className="scroll-mt-24 space-y-16">
      <header>
        <p className="eyebrow">5 · Neutral variants</p>
        <h2 className="mt-4 text-sm font-medium tracking-tight text-default">Hue & chroma presets</h2>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          Pure neutral locks chroma to zero. Warm / cool / bluish apply low chroma at a fixed hue.
          Custom keeps your sliders.
        </p>
      </header>
      <RadioGroup
        variant="scrim"
        value={config.variantId}
        onValueChange={(id) => {
          const v = VARIANT_PRESETS.find((p) => p.id === id)
          if (!v) return
          const t0 = presetDebugEnabled() && typeof performance !== 'undefined' ? performance.now() : 0
          const next = applyVariantToConfig(config, id as NeutralVariantId)
          logPresetGroup('variant', v.label, diffConfig(config, next))
          if (presetDebugEnabled()) {
            const dt = (typeof performance !== 'undefined' ? performance.now() : 0) - t0
            console.log('PresetPerf', 'applyVariantToConfig(ms)=', dt.toFixed(2))
          }
          onChange(next, v.label)
        }}
      >
        {VARIANT_PRESETS.map((v) => (
          <RadioGroupItem key={v.id} value={v.id}>{v.label}</RadioGroupItem>
        ))}
      </RadioGroup>
    </section>
  )
}

export const VariantsSection = memo(VariantsSectionInner)
