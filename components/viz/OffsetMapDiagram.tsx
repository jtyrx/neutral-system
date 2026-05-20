'use client'

import {memo, useMemo} from 'react'

type Props = {
  steps: number
  /** Shown in the card eyebrow, e.g. "Light" or "Dark elevated". */
  themeLabel: string
  /** Explanatory line under the title. */
  description: string
  /** Resolved global indices per role — same values as token derivation. */
  surfaceIndices: number[]
  borderIndices: number[]
  textIndices: number[]
  /** Global index of the alpha base swatch — renders a violet "Alpha" row when set. */
  alphaBaseIndex?: number
}

/** Same linear scale as role markers: index 0 at left, last index at right. */
function indexToLeftPercent(index: number, stepCount: number): string {
  const n = Math.max(2, stepCount)
  const denom = Math.max(1, n - 1)
  return `${(index / denom) * 100}%`
}

type RowProps = {
  label: string
  indices: number[]
  tone: string
  steps: number
  tickIndices: readonly number[]
}

const OffsetMapRow = memo(function OffsetMapRow({label, indices, tone, steps, tickIndices}: RowProps) {
  return (
    <div className="flex items-center gap-8 text-micro">
      <span className="w-64 shrink-0 font-medium text-muted">{label}</span>
      <div className="relative h-16 flex-1 rounded bg-chip">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded"
          aria-hidden
        >
          {tickIndices.map((i) => (
            <div
              key={i}
              className="absolute bottom-4 top-4 w-px -translate-x-1/2 bg-chip"
              style={{left: indexToLeftPercent(i, steps)}}
            />
          ))}
        </div>
        {indices.map((idx, k) => {
          const left = indexToLeftPercent(idx, steps)
          return (
            <span
              key={`${label}-${k}-${idx}`}
              className={`absolute top-0 z-10 h-full w-4 -translate-x-1/2 rounded-sm ${tone}`}
              style={{left}}
            />
          )
        })}
      </div>
    </div>
  )
})

function OffsetMapDiagramInner({
  steps,
  themeLabel,
  description,
  surfaceIndices,
  borderIndices,
  textIndices,
  alphaBaseIndex,
}: Props) {
  const n = Math.max(2, steps)

  const tickIndices = useMemo(() => Array.from({length: n}, (_, i) => i), [n])

  return (
    <div className="space-y-8 rounded-xl border border-hairline bg-raised px-16 py-12">
      <p className="eyebrow">Offset mapping · {themeLabel}</p>
      <p className="text-[0.7rem] text-muted">{description}</p>
      <OffsetMapRow label="Surface" indices={surfaceIndices} tone="bg-emerald-400/90" steps={steps} tickIndices={tickIndices} />
      <OffsetMapRow label="Border" indices={borderIndices} tone="bg-[var(--chrome-amber-fill-strong)]" steps={steps} tickIndices={tickIndices} />
      <OffsetMapRow label="Text" indices={textIndices} tone="bg-[var(--chrome-sky-fill-strong)]" steps={steps} tickIndices={tickIndices} />
      {alphaBaseIndex != null && (
        <OffsetMapRow
          label="Alpha"
          indices={[alphaBaseIndex]}
          tone="bg-violet-400/90"
          steps={steps}
          tickIndices={tickIndices}
        />
      )}
    </div>
  )
}

export const OffsetMapDiagram = memo(OffsetMapDiagramInner)
