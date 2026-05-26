/**
 * Spike: does colorjs.io's `.toGamut({space, method:'css'})` produce the same
 * effective max-chroma as our custom binary-search `maxInGamutChroma`?
 *
 * If yes (within ΔE_OK tolerance and < 1e-3 chroma delta), the engine's
 * `gamutProbing.maxInGamutChroma` can be deleted in favor of the library.
 *
 * Run: pnpm tsx scripts/research/bench-gamut-probe.ts
 */
import Color from 'colorjs.io'
import {maxInGamutChroma} from '../../lib/neutral-engine/gamutProbing'

type Gamut = 'srgb' | 'p3' | 'rec2020'
const GAMUTS: Gamut[] = ['srgb', 'p3', 'rec2020']

// Representative (L, H) grid: 7 lightness × 12 hues = 84 samples per gamut.
const Ls = [0.95, 0.85, 0.7, 0.55, 0.45, 0.3, 0.15]
const Hs = Array.from({length: 12}, (_, i) => i * 30)

function libraryMaxChroma(L: number, H: number, gamut: Gamut, cMax = 0.5): number {
  // Construct an over-saturated OKLCH color and clamp into gamut using the
  // CSS Color 4 algorithm. The clamped chroma is what the library considers max.
  const c = new Color('oklch', [L, cMax, H])
  if (c.inGamut(gamut)) return cMax
  const clamped = c.toGamut({space: gamut, method: 'css'}).to('oklch')
  return clamped.coords[1] ?? 0
}

function deltaEOKBetween(L: number, Ha: number, Ca: number, Hb: number, Cb: number): number {
  const a = new Color('oklch', [L, Ca, Ha])
  const b = new Color('oklch', [L, Cb, Hb])
  return a.deltaEOK(b)
}

type Row = {gamut: Gamut; L: number; H: number; ours: number; lib: number; absDelta: number; dEOK: number}
const rows: Row[] = []

for (const gamut of GAMUTS) {
  for (const L of Ls) {
    for (const H of Hs) {
      const ours = maxInGamutChroma(L, H, {targetSpace: gamut, cMax: 0.5})
      const lib = libraryMaxChroma(L, H, gamut, 0.5)
      const absDelta = Math.abs(ours - lib)
      const dEOK = deltaEOKBetween(L, H, ours, H, lib)
      rows.push({gamut, L, H, ours, lib, absDelta, dEOK})
    }
  }
}

const summary: Record<Gamut, {n: number; maxAbs: number; meanAbs: number; maxDE: number; meanDE: number}> = {
  srgb: {n: 0, maxAbs: 0, meanAbs: 0, maxDE: 0, meanDE: 0},
  p3: {n: 0, maxAbs: 0, meanAbs: 0, maxDE: 0, meanDE: 0},
  rec2020: {n: 0, maxAbs: 0, meanAbs: 0, maxDE: 0, meanDE: 0},
}
for (const r of rows) {
  const s = summary[r.gamut]
  s.n += 1
  s.maxAbs = Math.max(s.maxAbs, r.absDelta)
  s.meanAbs += r.absDelta
  s.maxDE = Math.max(s.maxDE, r.dEOK)
  s.meanDE += r.dEOK
}
for (const g of GAMUTS) {
  summary[g].meanAbs /= summary[g].n
  summary[g].meanDE /= summary[g].n
}

console.log('=== Gamut probe parity: ours (binary search) vs colorjs.io toGamut({method:"css"}) ===')
console.log(`Samples per gamut: ${Ls.length * Hs.length}`)
console.log()
console.log('gamut    n   max|ΔC|     mean|ΔC|    max ΔE_OK   mean ΔE_OK')
console.log('-----  ----  ----------  ----------  -----------  -----------')
for (const g of GAMUTS) {
  const s = summary[g]
  console.log(
    `${g.padEnd(6)} ${String(s.n).padStart(4)}  ${s.maxAbs.toExponential(2)}  ${s.meanAbs.toExponential(2)}  ${s.maxDE.toExponential(2)}    ${s.meanDE.toExponential(2)}`,
  )
}

// Verdict thresholds:
//   tight  : max|ΔC| < 1e-3, max ΔE_OK < 1e-3  -> delete our probe
//   loose  : max|ΔC| < 5e-3, max ΔE_OK < 5e-3  -> safe to delete, document delta
//   fail   : otherwise                          -> keep our probe
console.log()
for (const g of GAMUTS) {
  const s = summary[g]
  const tight = s.maxAbs < 1e-3 && s.maxDE < 1e-3
  const loose = s.maxAbs < 5e-3 && s.maxDE < 5e-3
  const verdict = tight ? 'TIGHT MATCH (delete ours)' : loose ? 'LOOSE MATCH (safe to delete)' : 'DIVERGES (keep ours)'
  console.log(`  ${g}: ${verdict}`)
}

// Worst offender per gamut for debugging:
console.log()
console.log('Worst-offender rows:')
for (const g of GAMUTS) {
  const worst = rows
    .filter((r) => r.gamut === g)
    .sort((a, b) => b.dEOK - a.dEOK)[0]
  if (worst) {
    console.log(
      `  ${g}: L=${worst.L} H=${worst.H}  ours=${worst.ours.toFixed(5)} lib=${worst.lib.toFixed(5)} ΔE_OK=${worst.dEOK.toExponential(2)}`,
    )
  }
}

// Perf: time both implementations on the full 84-sample grid × 100 runs.
const RUNS = 100
console.log()
console.log('=== Perf: 84 samples × 100 runs per gamut ===')
for (const g of GAMUTS) {
  // warmup
  for (let i = 0; i < 10; i++) for (const L of Ls) for (const H of Hs) maxInGamutChroma(L, H, {targetSpace: g, cMax: 0.5})
  const t0 = performance.now()
  for (let r = 0; r < RUNS; r++) for (const L of Ls) for (const H of Hs) maxInGamutChroma(L, H, {targetSpace: g, cMax: 0.5})
  const tOurs = performance.now() - t0

  for (let i = 0; i < 10; i++) for (const L of Ls) for (const H of Hs) libraryMaxChroma(L, H, g, 0.5)
  const t1 = performance.now()
  for (let r = 0; r < RUNS; r++) for (const L of Ls) for (const H of Hs) libraryMaxChroma(L, H, g, 0.5)
  const tLib = performance.now() - t1

  const perOurs = tOurs / (RUNS * Ls.length * Hs.length)
  const perLib = tLib / (RUNS * Ls.length * Hs.length)
  console.log(`  ${g}: ours ${perOurs.toFixed(3)} ms/call, lib ${perLib.toFixed(3)} ms/call (lib ${(perLib / perOurs).toFixed(2)}× ours)`)
}
