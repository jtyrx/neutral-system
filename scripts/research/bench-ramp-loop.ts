/**
 * Spike: baseline `buildGlobalScale` perf at 8 / 14 / 24 / 48 stops with the
 * current colorjs.io setup. Establishes the number the SYNTHESIS will compare
 * any swap against.
 *
 * Run: pnpm tsx scripts/research/bench-ramp-loop.ts
 */
import {buildGlobalScale} from '../../lib/neutral-engine/globalScale'
import type {GlobalScaleConfig} from '../../lib/neutral-engine/types'

const STEPS = [8, 14, 24, 48]
const RUNS = 200

// Cache key in globalScale.ts hashes `hue` and other numeric fields, but NOT
// `variantId`. Bust the cache by perturbing `hue` instead.
function cfgAtSteps(steps: number, hueOffset: number): GlobalScaleConfig {
  return {
    steps,
    lHigh: 0.985,
    lLow: 0.04,
    chromaMode: 'fixed',
    baseChroma: 0.04,
    hue: 250 + hueOffset * 0.0001, // unique per run; semantically near-identical
    namingStyle: 'tw-50-950',
    lCurve: 'linear',
    lCurveStrength: 1,
    variantId: 'custom',
  } as GlobalScaleConfig
}

// Engine has an internal cache keyed by config — bust it per-run by varying `variantId`.
function timeBuild(n: number, runs: number): {totalMs: number; perBuildMs: number; perStopUs: number} {
  // warmup
  for (let i = 0; i < 20; i++) buildGlobalScale(cfgAtSteps(n, -i - 1))
  const t0 = performance.now()
  for (let r = 0; r < runs; r++) buildGlobalScale(cfgAtSteps(n, r))
  const totalMs = performance.now() - t0
  const perBuildMs = totalMs / runs
  const perStopUs = (perBuildMs * 1000) / n
  return {totalMs, perBuildMs, perStopUs}
}

console.log('=== buildGlobalScale baseline (colorjs.io, current engine) ===')
console.log(`Runs per stop count: ${RUNS}`)
console.log()
console.log('stops   total ms   per-build ms   per-stop µs')
console.log('-----   --------   ------------   -----------')
for (const n of STEPS) {
  const r = timeBuild(n, RUNS)
  console.log(`${String(n).padStart(5)}   ${r.totalMs.toFixed(1).padStart(8)}   ${r.perBuildMs.toFixed(3).padStart(12)}   ${r.perStopUs.toFixed(1).padStart(11)}`)
}

// Repeat with the cache hot (same variantId) so we see the cached-hit cost.
console.log()
console.log('=== Cached-hit cost (engine memo hit) ===')
console.log('stops   total ms   per-build ms   per-stop µs')
console.log('-----   --------   ------------   -----------')
for (const n of STEPS) {
  const cfg = cfgAtSteps(n, 0)
  // prime
  for (let i = 0; i < 20; i++) buildGlobalScale(cfg)
  const t0 = performance.now()
  for (let r = 0; r < RUNS; r++) buildGlobalScale(cfg)
  const totalMs = performance.now() - t0
  const perBuildMs = totalMs / RUNS
  const perStopUs = (perBuildMs * 1000) / n
  console.log(`${String(n).padStart(5)}   ${totalMs.toFixed(1).padStart(8)}   ${perBuildMs.toFixed(3).padStart(12)}   ${perStopUs.toFixed(1).padStart(11)}`)
}

console.log()
console.log('Interpretation:')
console.log('- The "baseline" rows are the cost any colorjs.io→<other> swap is compared against.')
console.log('- The "cached-hit" rows show the floor: anything below that is achievable via memoization alone.')
console.log('- 48-stop per-build ms is the worst case for a continuous hue drag at 60fps (16.67 ms budget).')
