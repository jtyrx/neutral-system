'use client'

import { memo, useMemo } from 'react'

import { buildGlobalScale } from '@/lib/neutral-engine/globalScale'
import type { ChromaMode, GlobalScaleConfig } from '@/lib/neutral-engine/types'

const CHROMA_ROWS: readonly { chromaMode: ChromaMode; label: string }[] = [
  { chromaMode: 'achromatic', label: 'Achromatic' },
  { chromaMode: 'fixed', label: 'Fixed chroma' },
  { chromaMode: 'taper_mid', label: 'Taper (mid emphasis)' },
  { chromaMode: 'taper_ends', label: 'Taper (ends emphasis)' },
] as const

type Props = {
  config: GlobalScaleConfig
}

function ChromaModeComparisonRailInner({ config }: Props) {
  const rows = useMemo(
    () =>
      CHROMA_ROWS.map((row) => ({
        ...row,
        swatches: buildGlobalScale({ ...config, chromaMode: row.chromaMode }),
      })),
    [config],
  )

  const n = rows[0]?.swatches.length ?? 0
  const minStripWidth = Math.max(n * 8, 280)

  return (
    <div
      id="neutral-ladder-comparison-rail"
      role="region"
      aria-label="Neutral ladder comparison rail"
      aria-describedby="neutral-ladder-comparison-rail-description"
      className="space-y-3"
    >
      <p
        id="neutral-ladder-comparison-rail-description"
        aria-hidden="true"
        className="text-xs text-white/45"
      >
        Four engine modes side by side: same step count, lightness ramp, hue, and base chroma —
        only chroma distribution changes per row.
      </p>
      <div className="space-y-3">
        {rows.map(({ chromaMode, label, swatches }) => (
          <div
            key={chromaMode}
            className="grid gap-2 sm:grid-cols-1 sm:items-stretch sm:gap-2"
          >
            <div className="flex items-center ">
              <p className="text-left text-[0.65rem] font-medium font-mono uppercase tracking-wide text-white/40">
                {label}
              </p>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-lg border border-white/10 bg-black/20">
              <div
                className="flex min-h-[4.5rem]"
                style={{ minWidth: `${minStripWidth}px` }}
                role="img"
                aria-label={`${label}: ${swatches.length} steps`}
              >
                {swatches.map((s) => (
                  <div
                    key={s.index}
                    className="min-w-[8px] flex-1 border-l border-white/5 first:border-l-0"
                    style={{ backgroundColor: s.serialized.hex }}
                    title={`${s.label} · ${s.serialized.oklchCss}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChromaModeComparisonRail = memo(ChromaModeComparisonRailInner)
