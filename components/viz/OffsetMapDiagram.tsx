'use client'

type Props = {
  steps: number
  fillStart: number
  strokeStart: number
  textStart: number
  fillCount: number
  strokeCount: number
  textCount: number
}

export function OffsetMapDiagram({
  steps,
  fillStart,
  strokeStart,
  textStart,
  fillCount,
  strokeCount,
  textCount,
}: Props) {
  const n = Math.max(2, steps)
  const row = (label: string, start: number, count: number, tone: string) => (
    <div className="flex items-center gap-2 text-[0.65rem]">
      <span className="w-16 shrink-0 font-medium text-white/55">{label}</span>
      <div className="relative h-4 flex-1 rounded bg-white/5">
        {Array.from({length: count}).map((_, k) => {
          const idx = start + k
          const left = `${(idx / (n - 1)) * 100}%`
          return (
            <span
              key={`${label}-${k}`}
              className={`absolute top-0 h-full w-1 -translate-x-1/2 rounded-sm ${tone}`}
              style={{left}}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
      <p className="eyebrow">Offset mapping</p>
      <p className="text-[0.7rem] text-white/45">
        Tick marks show where each system shade pulls from the global index (light theme indices).
      </p>
      {row('Fills', fillStart, fillCount, 'bg-emerald-400/90')}
      {row('Strokes', strokeStart, strokeCount, 'bg-amber-400/90')}
      {row('Text', textStart, textCount, 'bg-sky-400/90')}
    </div>
  )
}
