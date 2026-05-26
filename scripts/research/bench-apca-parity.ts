/**
 * Spike: does colorjs.io's `.contrast(other, 'APCA')` agree numerically with
 * the canonical `apca-w3` implementation?
 *
 * If yes (|ΔLc| < 0.1 across the test grid), drop the `apca-w3` devDependency
 * and use colorjs.io as the APCA source. If no, add `apca-w3` as a real dep.
 *
 * Run: pnpm tsx scripts/research/bench-apca-parity.ts
 */
import Color from 'colorjs.io'
// @ts-expect-error - apca-w3 has no bundled types; this is a measurement-only script
import {APCAcontrast, sRGBtoY} from 'apca-w3'

// Build a representative grid: 10 lightnesses × 5 chromas × 6 hues = 300 colors.
// Compute APCA for every (text, bg) pair where text != bg, both ways (polarity matters),
// then sample 200 random pairs and compare.
const Ls = [0.05, 0.15, 0.3, 0.45, 0.55, 0.7, 0.85, 0.92, 0.97, 0.99]
const Cs = [0, 0.05, 0.12, 0.2, 0.3]
const Hs = [0, 60, 120, 200, 270, 330]

const palette: Color[] = []
for (const L of Ls) for (const C of Cs) for (const H of Hs) palette.push(new Color('oklch', [L, C, H]))

function libApca(text: Color, bg: Color): number {
  // colorjs.io APCA: `bg.contrast(text, 'APCA')` is the canonical signature
  // (https://colorjs.io/docs/contrast#apca). Calling on the bg, passing text.
  return bg.contrast(text, 'APCA') as number
}

function w3Apca(text: Color, bg: Color): number {
  // apca-w3 expects integer 0–255 sRGB for both. Clamp into sRGB gamut first.
  const t = text.to('srgb').toGamut({space: 'srgb', method: 'css'})
  const b = bg.to('srgb').toGamut({space: 'srgb', method: 'css'})
  const toRgb = (c: Color): [number, number, number] =>
    c.coords.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255)) as [number, number, number]
  const txt = toRgb(t)
  const bgRgb = toRgb(b)
  // apca-w3 accepts hex strings, integer arrays, or pre-luminance Y values.
  // The (textY, bgY) overload is the canonical pure-math path.
  return APCAcontrast(sRGBtoY(txt), sRGBtoY(bgRgb)) as number
}

// Deterministic pseudo-random pair selection (Mulberry32) so reruns are stable.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(42)
const PAIRS = 200
const samples: {text: Color; bg: Color; lib: number; w3: number; absDelta: number}[] = []
for (let i = 0; i < PAIRS; i++) {
  const a = palette[Math.floor(rnd() * palette.length)]!
  let b = palette[Math.floor(rnd() * palette.length)]!
  if (a === b) b = palette[(palette.indexOf(b) + 1) % palette.length]!
  const lib = libApca(a, b)
  const w3 = w3Apca(a, b)
  samples.push({text: a, bg: b, lib, w3, absDelta: Math.abs(lib - w3)})
}

let maxDelta = 0
let sumDelta = 0
let signDisagree = 0
for (const s of samples) {
  maxDelta = Math.max(maxDelta, s.absDelta)
  sumDelta += s.absDelta
  if (Math.sign(s.lib) !== Math.sign(s.w3) && s.lib !== 0 && s.w3 !== 0) signDisagree += 1
}
const meanDelta = sumDelta / samples.length

console.log('=== APCA parity: colorjs.io contrast("APCA") vs apca-w3 APCAcontrast ===')
console.log(`Samples: ${PAIRS} random pairs from ${palette.length}-color OKLCH grid`)
console.log()
console.log(`max |ΔLc|       : ${maxDelta.toFixed(4)}`)
console.log(`mean |ΔLc|      : ${meanDelta.toFixed(4)}`)
console.log(`polarity disagree: ${signDisagree} / ${samples.length}`)
console.log()

// Verdict thresholds:
//   tight (<0.1)   : numerical agreement, drop apca-w3
//   loose (<1.0)   : minor rounding, still drop apca-w3 (cite both)
//   fail (>1.0)    : different math revision, KEEP apca-w3
const tight = maxDelta < 0.1 && signDisagree === 0
const loose = maxDelta < 1.0 && signDisagree === 0
const verdict = tight
  ? 'TIGHT MATCH — drop apca-w3, use colorjs.io'
  : loose
    ? 'LOOSE MATCH — safe to drop apca-w3, document tolerance'
    : 'DIVERGES — KEEP apca-w3 as source of truth'
console.log(`Verdict: ${verdict}`)

// Worst-offender rows for triage:
console.log()
console.log('Worst-offender rows (top 5 by |ΔLc|):')
samples
  .sort((a, b) => b.absDelta - a.absDelta)
  .slice(0, 5)
  .forEach((s) => {
    const ti = s.text.to('oklch').coords
    const bi = s.bg.to('oklch').coords
    console.log(
      `  text oklch(${ti[0]!.toFixed(2)} ${ti[1]!.toFixed(2)} ${ti[2]!.toFixed(0)})  bg oklch(${bi[0]!.toFixed(2)} ${bi[1]!.toFixed(2)} ${bi[2]!.toFixed(0)})  lib=${s.lib.toFixed(2)}  w3=${s.w3.toFixed(2)}  Δ=${s.absDelta.toFixed(3)}`,
    )
  })
