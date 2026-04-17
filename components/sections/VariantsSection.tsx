'use client'

import {memo} from 'react'

import {applyVariantToConfig, VARIANT_PRESETS} from '@/lib/neutral-engine/variants'
import type {GlobalScaleConfig, NeutralVariantId} from '@/lib/neutral-engine/types'

type Props = {
  config: GlobalScaleConfig
  onChange: (next: GlobalScaleConfig) => void
}

function VariantsSectionInner({config, onChange}: Props) {
  return (
    <section id="variants" className="scroll-mt-6 space-y-4">
      <header>
        <p className="eyebrow">5 · Neutral variants</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Hue & chroma presets</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Pure neutral locks chroma to zero. Warm / cool / bluish apply low chroma at a fixed hue.
          Custom keeps your sliders.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {VARIANT_PRESETS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(applyVariantToConfig(config, v.id as NeutralVariantId))}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              config.variantId === v.id
                ? 'border-white/40 bg-white/15 text-white'
                : 'border-white/12 bg-white/5 text-white/75 hover:bg-white/10'
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
