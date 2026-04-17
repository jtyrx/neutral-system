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
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
      <p className="eyebrow">Theme range</p>
      <div className="flex h-8 w-full overflow-hidden rounded-lg border border-white/10">
        <div
          className="flex items-center justify-center bg-gradient-to-r from-white/25 to-white/5 text-[0.6rem] text-black"
          style={{width: `${lightPct}%`}}
        >
          Light UI pool
        </div>
        <div
          className="flex items-center justify-center bg-gradient-to-r from-zinc-800 to-zinc-950 text-[0.6rem] text-white/80"
          style={{width: `${darkPct}%`}}
        >
          Dark segment ({seg})
        </div>
      </div>
      <p className="text-[0.65rem] text-white/45">
        Dark elevated mode primarily uses the right-hand segment (last {seg} global steps).
      </p>
    </div>
  )
}
