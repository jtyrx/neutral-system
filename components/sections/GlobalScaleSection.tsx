'use client'

import {memo, useCallback, useEffect, useRef, useState} from 'react'

import {ChromaModeComparisonRail} from '@/components/viz/ChromaModeComparisonRail'
import {LightnessLadder} from '@/components/viz/LightnessLadder'
import {LightnessSparkline} from '@/components/viz/LightnessSparkline'
import {logPresetGroup} from '@/lib/debug/presetDebug'
import {
  clampGlobalScaleSteps,
  GLOBAL_SCALE_STEP_MAX,
  GLOBAL_SCALE_STEP_MIN,
} from '@/lib/neutral-engine/globalScale'
import type {GlobalScaleConfig, GlobalSwatch, NamingStyle} from '@/lib/neutral-engine/types'

type Props = {
  config: GlobalScaleConfig
  patchGlobal: <K extends keyof GlobalScaleConfig>(
    key: K,
    value: GlobalScaleConfig[K],
    label?: string,
  ) => void
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

const namingOptions: {id: NamingStyle; label: string}[] = [
  {id: 'token_ladder', label: 'Token Ladder'},
  {id: 'semantic', label: '0 … n−1'},
  {id: 'numeric_desc', label: '100 → 4'},
]

const chromaOptions: {id: GlobalScaleConfig['chromaMode']; label: string}[] = [
  {id: 'achromatic', label: 'Achromatic'},
  {id: 'fixed', label: 'Fixed chroma'},
  {id: 'taper_mid', label: 'Taper (mid emphasis)'},
  {id: 'taper_ends', label: 'Taper (ends emphasis)'},
]

const stepOptions: number[] = Array.from(
  {length: GLOBAL_SCALE_STEP_MAX - GLOBAL_SCALE_STEP_MIN + 1},
  (_, i) => GLOBAL_SCALE_STEP_MIN + i,
)

type RampProps = {
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

/** Isolated from control form so typing does not re-paint the full strip on every keystroke. */
const GlobalScaleRampVisualization = memo(function GlobalScaleRampVisualization({
  global,
  selectedIndex,
  onSelectSwatch,
}: RampProps) {
  const n = global.length
  const ringIndex = selectedIndex == null || n === 0 ? null : Math.min(selectedIndex, n - 1)

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-hairline">
        <div className="flex min-h-[4.5rem]" style={{minWidth: `${Math.max(global.length * 8, 320)}px`}}>
          {global.map((s) => (
            <button
              key={s.index}
              type="button"
              title={s.serialized.oklchCss}
              onClick={() => onSelectSwatch(s.index)}
              className={`min-w-[8px] flex-1 border-l border-hairline first:border-l-0 ${
                ringIndex === s.index ? 'ring-2 ring-inset ring-white/50' : ''
              }`}
              style={{backgroundColor: s.serialized.hex}}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
        <LightnessLadder swatches={global} onSelect={onSelectSwatch} selectedIndex={ringIndex} />
        <LightnessSparkline swatches={global} />
      </div>
    </>
  )
})

function numOr(prev: number, raw: string): number {
  const v = Number(raw)
  return Number.isFinite(v) ? v : prev
}

/**
 * rAF-coalesced patch wrapper.
 *
 * Number inputs (and `<select>` with arrow-key scrub) fire `onChange` per keystroke / per drag
 * tick. Each event would otherwise trigger `startTransition` + full derivation. Here we:
 *
 * 1. Optimistically display the user's latest value via a local shadow ref so the input feels
 *    instant (React's controlled-input model needs the value to echo back).
 * 2. Coalesce commits to `patchGlobal` to **one per animation frame** — rapid scrubs produce a
 *    single `setGlobalConfig` transition per frame regardless of input frequency.
 * 3. On unmount, flush any pending value so changes aren't lost.
 */
type PatchGlobal = Props['patchGlobal']

function useCoalescedPatch(patchGlobal: PatchGlobal) {
  const pendingRef = useRef<Map<keyof GlobalScaleConfig, {value: unknown; label: string}>>(new Map())
  const rafRef = useRef<number | null>(null)

  const flush = useCallback(() => {
    rafRef.current = null
    const pending = pendingRef.current
    pendingRef.current = new Map()
    for (const [key, {value, label}] of pending.entries()) {
      patchGlobal(key as keyof GlobalScaleConfig, value as never, label)
    }
  }, [patchGlobal])

  const schedule = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], label: string) => {
      pendingRef.current.set(key, {value, label})
      // Debug: mark this as a scale-kind interaction so downstream timers / counters label correctly.
      logPresetGroup('scale', `${label}=${String(value)}`, {[key]: value})
      if (rafRef.current == null) {
        rafRef.current =
          typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(flush) : (setTimeout(flush, 0) as unknown as number)
      }
    },
    [flush],
  )

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(rafRef.current)
        // Flush synchronously so in-flight values aren't lost on unmount.
        flush()
      }
    }
  }, [flush])

  return schedule
}

function GlobalScaleSectionInner({config, patchGlobal, global, selectedIndex, onSelectSwatch}: Props) {
  const patch = useCoalescedPatch(patchGlobal)
  const [showComparison, setShowComparison] = useState(false)

  return (
    <section id="global" className="scroll-mt-6 space-y-6">
      <header>
        <p className="eyebrow">1 · Global scale</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-default">Neutral ladder</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Linear OKLCH lightness from light to dark (8–48 steps; default 41). Hue and chroma stay locked or shaped by the
          chroma mode. Tier-1 primitives feed semantic tokens.
        </p>
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Compare chroma modes side-by-side for the current hue / base chroma.
        </p>
        <button
          type="button"
          onClick={() => setShowComparison((v) => !v)}
          className="rounded-full border border-hairline bg-[var(--ns-chip)] px-3 py-1.5 text-xs font-medium text-subtle transition hover:bg-[var(--ns-hairline)]"
          aria-expanded={showComparison}
          aria-controls="chroma-mode-comparison-rail"
        >
          {showComparison ? 'Hide comparison' : 'Show comparison'}
        </button>
      </div>

      {showComparison ? (
        <div id="chroma-mode-comparison-rail">
          <ChromaModeComparisonRail config={config} />
        </div>
      ) : null}

      <GlobalScaleRampVisualization global={global} selectedIndex={selectedIndex} onSelectSwatch={onSelectSwatch} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="ns-label">Steps</span>
          <select
            className="ns-input font-mono"
            value={clampGlobalScaleSteps(config.steps)}
            onChange={(e) => patch('steps', Number(e.target.value), 'Steps')}
          >
            {stepOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="ns-label">Lightest L (0–1)</span>
          <input
            type="number"
            step={0.005}
            className="ns-input font-mono"
            value={config.lHigh}
            onChange={(e) => patch('lHigh', numOr(config.lHigh, e.target.value), 'Lightest L')}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Darkest L (0–1)</span>
          <input
            type="number"
            step={0.005}
            className="ns-input font-mono"
            value={config.lLow}
            onChange={(e) => patch('lLow', numOr(config.lLow, e.target.value), 'Darkest L')}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Hue (°)</span>
          <input
            type="number"
            className="ns-input font-mono"
            value={config.hue}
            disabled={config.chromaMode === 'achromatic'}
            onChange={(e) => patch('hue', numOr(config.hue, e.target.value), 'Hue')}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Base chroma</span>
          <input
            type="number"
            step={0.001}
            className="ns-input font-mono"
            value={config.baseChroma}
            disabled={config.chromaMode === 'achromatic'}
            onChange={(e) => patch('baseChroma', numOr(config.baseChroma, e.target.value), 'Base chroma')}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Naming</span>
          <select
            className="ns-input"
            value={config.namingStyle}
            onChange={(e) => patch('namingStyle', e.target.value as NamingStyle, 'Naming')}
          >
            {namingOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2 lg:col-span-3">
          <span className="ns-label">Chroma mode</span>
          <select
            className="ns-input"
            value={config.chromaMode}
            onChange={(e) =>
              patch('chromaMode', e.target.value as GlobalScaleConfig['chromaMode'], 'Chroma mode')
            }
          >
            {chromaOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

export const GlobalScaleSection = memo(GlobalScaleSectionInner)
