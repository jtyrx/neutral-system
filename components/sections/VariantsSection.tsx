'use client'

import {memo} from 'react'

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
    <section id="variants" className="scroll-mt-6 space-y-4">
      <header>
        <p className="eyebrow">5 · Neutral variants</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--ns-text)]">Hue & chroma presets</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ns-text-muted)]">
          Pure neutral locks chroma to zero. Warm / cool / bluish apply low chroma at a fixed hue.
          Custom keeps your sliders.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {VARIANT_PRESETS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => {
              const t0 = presetDebugEnabled() && typeof performance !== 'undefined' ? performance.now() : 0
              const next = applyVariantToConfig(config, v.id as NeutralVariantId)
              logPresetGroup('variant', v.label, diffConfig(config, next))
              if (presetDebugEnabled()) {
                const dt = (typeof performance !== 'undefined' ? performance.now() : 0) - t0
                console.log('PresetPerf', 'applyVariantToConfig(ms)=', dt.toFixed(2))
              }
              onChange(next, v.label)
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              config.variantId === v.id
                ? 'border-[var(--ns-hairline-strong)] bg-[var(--ns-overlay-strong)] text-[var(--ns-text)]'
                : 'border-[var(--ns-hairline)] bg-[var(--ns-chip)] text-[var(--ns-text-subtle)] hover:bg-[var(--ns-hairline)]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export const VariantsSection = memo(VariantsSectionInner)
