'use client'

import {memo, useMemo} from 'react'

import {applyContrastEmphasisToSystemMapping} from '@/lib/neutral-engine/effectiveMapping'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

type Props = {
  /** Raw mapping inputs (same base used for emphasis comparison). */
  systemConfig: SystemMappingConfig
  /** Global ramp length. */
  steps: number
}

/**
 * Read-only: shows how **surface** resolved indices differ between subtle and inverse contrast emphasis.
 */
function ContrastSpacingPreviewInner({systemConfig, steps}: Props) {
  const n = Math.max(2, steps)

  const {subtleSurface, inverseSurface} = useMemo(() => {
    const subtle = applyContrastEmphasisToSystemMapping(systemConfig, 'subtle')
    const inverse = applyContrastEmphasisToSystemMapping(systemConfig, 'inverse')
    return {
      subtleSurface: previewResolvedRoleIndices(subtle, n, 'light').surface,
      inverseSurface: previewResolvedRoleIndices(inverse, n, 'light').surface,
    }
  }, [systemConfig, n])

  return (
    <div
      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
      role="img"
      aria-label="Surface ladder spacing: subtle versus inverse contrast emphasis"
    >
      <p className="text-[0.6rem] font-medium uppercase tracking-wide text-white/45">Surface spacing · Light</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <SpacingRow label="Subtle" indices={subtleSurface} maxSpan={n} />
        <SpacingRow label="Inverse" indices={inverseSurface} maxSpan={n} />
      </div>
      <p className="mt-2 text-[0.55rem] leading-snug text-white/35">
        Dots mark resolved global indices for the surface ramp. Inverse increases contrast distance
        between picks.
      </p>
    </div>
  )
}

function SpacingRow({
  label,
  indices,
  maxSpan,
}: {
  label: string
  indices: number[]
  maxSpan: number
}) {
  const denom = Math.max(1, maxSpan - 1)
  return (
    <div>
      <p className="text-[0.6rem] text-white/50">{label}</p>
      <div className="relative mt-1 h-5 rounded bg-white/[0.06]">
        {indices.map((idx) => (
          <span
            key={`${label}-${idx}`}
            className="absolute top-1/2 h-2 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-amber-400/80"
            style={{left: `${(idx / denom) * 100}%`}}
            title={`index ${idx}`}
          />
        ))}
      </div>
      <p className="mt-0.5 font-mono text-[0.55rem] text-white/35">{indices.join(', ') || '—'}</p>
    </div>
  )
}

export const ContrastSpacingPreview = memo(ContrastSpacingPreviewInner)
