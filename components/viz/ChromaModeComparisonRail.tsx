'use client'

import {memo, useDeferredValue, useMemo} from 'react'

import {buildGlobalScale} from '@/lib/neutral-engine/globalScale'
import type {ChromaMode, GlobalScaleConfig} from '@/lib/neutral-engine/types'

const CHROMA_ROWS: readonly { chromaMode: ChromaMode; label: string }[] = [
  {chromaMode: 'achromatic', label: 'Achromatic'},
  {chromaMode: 'fixed', label: 'Fixed chroma'},
  {chromaMode: 'taper_mid', label: 'Taper (mid emphasis)'},
  {chromaMode: 'taper_ends', label: 'Taper (ends emphasis)'},
] as const

type Props = {
  config: GlobalScaleConfig
}

function ChromaModeComparisonRailInner({config}: Props) {
  // Let preset clicks commit immediately; the comparison rail can lag a frame.
  const deferredConfig = useDeferredValue(config)
  const rows = useMemo(() => {
    const out = CHROMA_ROWS.map((row) => ({
      ...row,
      swatches: buildGlobalScale({...deferredConfig, chromaMode: row.chromaMode}),
    }))
    return out
  }, [deferredConfig])

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
        className="text-xs text-[var(--ns-text-muted)]"
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
              <p className="text-left text-[0.65rem] font-medium font-mono uppercase tracking-wide text-[var(--ns-text-faint)]">
                {label}
              </p>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-lg border border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]">
              <div
                className="flex min-h-[4.5rem]"
                style={{ minWidth: `${minStripWidth}px` }}
                role="img"
                aria-label={`${label}: ${swatches.length} steps`}
              >
                {swatches.map((s) => (
                  <div
                    key={s.index}
                    className="min-w-[8px] flex-1 border-l border-[var(--ns-hairline)] first:border-l-0"
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
