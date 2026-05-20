'use client'

type Props = {
  steps: number
  darkSegmentLength: number
}

export function ThemeRangeBar({steps, darkSegmentLength}: Props) {
  const n = Math.max(2, steps)
  const seg = Math.min(darkSegmentLength, n)
  const lightPct = ((n - seg) / (n - 1)) * 100
  const darkPct = (seg / (n - 1)) * 100

  return (
    <div className="space-y-8 rounded-xl border border-hairline bg-raised px-16 py-12">
      <p className="eyebrow">Theme range</p>
      <div className="flex h-32 w-full overflow-hidden rounded-lg border border-hairline">
        <div
          className="flex items-center justify-center bg-linear-to-r from-white/25 to-white/5 text-[0.6rem] text-black"
          style={{width: `${lightPct}%`}}
        >
          Light UI pool
        </div>
        <div
          className="flex items-center justify-center bg-linear-to-r from-zinc-800 to-zinc-950 text-[0.6rem] text-default"
          style={{width: `${darkPct}%`}}
        >
          Dark segment ({seg})
        </div>
      </div>
      <p className="text-micro text-muted">
        Dark elevated mode primarily uses the right-hand segment (last {seg} global steps).
      </p>
    </div>
  )
}
