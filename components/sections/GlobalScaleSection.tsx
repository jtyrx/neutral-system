'use client'

import {memo, useCallback, useEffect, useRef, useState} from 'react'

import {ResponsiveSelect} from '@/components/ui/responsive-select'
import {ChromaModeComparisonRail} from '@/components/viz/ChromaModeComparisonRail'
import {LightnessLadder} from '@/components/viz/LightnessLadder'
import {LightnessSparkline} from '@/components/viz/LightnessSparkline'
import {logPresetGroup} from '@/lib/debug/presetDebug'
import {
  clampGlobalScaleSteps,
  GLOBAL_SCALE_STEP_MAX,
  GLOBAL_SCALE_STEP_MIN,
} from '@/lib/neutral-engine/globalScale'
import type {GlobalScaleConfig, GlobalSwatch, LCurve, NamingStyle} from '@/lib/neutral-engine/types'

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

const curveOptions: {id: LCurve; label: string}[] = [
  {id: 'linear', label: 'Linear'},
  {id: 'ease-in-dark', label: 'Ease into dark'},
  {id: 'ease-out-light', label: 'Ease out light'},
  {id: 's-curve', label: 'S-curve'},
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

      <div className="grid gap-4 nsb-lg:grid-cols-[1fr_14rem]">
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
    <section id="global-scale-section" className="scroll-mt-6 space-y-6">
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
          className="rounded-full border border-hairline bg-(--ns-chip) px-3 py-1.5 text-xs font-medium text-subtle transition hover:bg-sidebar-border"
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

      <div 
      id="global-scale-controls"
      className="grid gap-4 sm:grid-cols-2 nsb-lg:grid-cols-3">
        <label className="space-y-1">
          <span className="ns-label">Steps</span>
          <ResponsiveSelect
            id="global-scale-controls-steps"
            className="font-mono"
            value={String(clampGlobalScaleSteps(config.steps))}
            options={stepOptions.map((n) => ({value: String(n), label: String(n)}))}
            onValueChange={(v) => patch('steps', Number(v), 'Steps')}
          />
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
          <span 
          className="ns-label">Naming</span>
          <ResponsiveSelect
            id="global-scale-controls-naming"
            value={config.namingStyle}
            options={namingOptions.map((o) => ({value: o.id, label: o.label}))}
            onValueChange={(v) => patch('namingStyle', v as NamingStyle, 'Naming')}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Chroma mode</span>
          <ResponsiveSelect
            id="global-scale-controls-chroma-mode"
            value={config.chromaMode}
            options={chromaOptions.map((o) => ({value: o.id, label: o.label}))}
            onValueChange={(v) =>
              patch('chromaMode', v as GlobalScaleConfig['chromaMode'], 'Chroma mode')
            }
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">L curve</span>
          <ResponsiveSelect
            id="global-scale-controls-l-curve"
            value={config.lCurve ?? 'linear'}
            options={curveOptions.map((o) => ({value: o.id, label: o.label}))}
            onValueChange={(v) => patch('lCurve', v as LCurve, 'L curve')}
          />
        </label>
        {config.chromaMode !== 'achromatic' ? (
          <>
            <label className="space-y-1">
              <span className="ns-label">Chroma (light end)</span>
              <input
                type="number"
                step={0.001}
                className="ns-input font-mono"
                value={config.chromaLight ?? config.baseChroma}
                onChange={(e) =>
                  patch('chromaLight', numOr(config.chromaLight ?? config.baseChroma, e.target.value), 'Chroma light')
                }
              />
            </label>
            <label className="space-y-1">
              <span className="ns-label">Chroma (dark end)</span>
              <input
                type="number"
                step={0.001}
                className="ns-input font-mono"
                value={config.chromaDark ?? config.baseChroma}
                onChange={(e) =>
                  patch('chromaDark', numOr(config.chromaDark ?? config.baseChroma, e.target.value), 'Chroma dark')
                }
              />
            </label>
            <label className="space-y-1">
              <span className="ns-label">Hue light end (°)</span>
              <input
                type="number"
                className="ns-input font-mono"
                value={config.hueLight ?? config.hue}
                onChange={(e) =>
                  patch('hueLight', numOr(config.hueLight ?? config.hue, e.target.value), 'Hue light')
                }
              />
            </label>
            <label className="space-y-1">
              <span className="ns-label">Hue dark end (°)</span>
              <input
                type="number"
                className="ns-input font-mono"
                value={config.hueDark ?? config.hue}
                onChange={(e) =>
                  patch('hueDark', numOr(config.hueDark ?? config.hue, e.target.value), 'Hue dark')
                }
              />
            </label>
          </>
        ) : null}
      </div>
    </section>
  )
}

export const GlobalScaleSection = memo(GlobalScaleSectionInner)
