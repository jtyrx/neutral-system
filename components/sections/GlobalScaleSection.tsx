'use client'

import {memo} from 'react'

import type {GlobalScaleConfig, GlobalSwatch, NamingStyle} from '@/lib/neutral-engine/types'
import {LightnessLadder} from '@/components/viz/LightnessLadder'
import {LightnessSparkline} from '@/components/viz/LightnessSparkline'

type Props = {
  config: GlobalScaleConfig
  onChange: (next: GlobalScaleConfig) => void
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

const namingOptions: {id: NamingStyle; label: string}[] = [
  {id: 'semantic', label: '0 … n−1'},
  {id: 'numeric_desc', label: '100 → 4'},
  {id: 'token_ladder', label: 'Token ladder'},
]

const chromaOptions: {id: GlobalScaleConfig['chromaMode']; label: string}[] = [
  {id: 'achromatic', label: 'Achromatic'},
  {id: 'fixed', label: 'Fixed chroma'},
  {id: 'taper_mid', label: 'Taper (mid emphasis)'},
  {id: 'taper_ends', label: 'Taper (ends emphasis)'},
]

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
  const ringIndex =
    selectedIndex == null || n === 0
      ? null
      : Math.min(selectedIndex, n - 1)

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <div
          className="flex min-h-[4.5rem]"
          style={{minWidth: `${Math.max(global.length * 8, 320)}px`}}
        >
          {global.map((s) => (
            <button
              key={s.index}
              type="button"
              title={s.serialized.oklchCss}
              onClick={() => onSelectSwatch(s.index)}
              className={`min-w-[8px] flex-1 border-l border-white/5 first:border-l-0 ${
                ringIndex === s.index ? 'ring-2 ring-inset ring-white/50' : ''
              }`}
              style={{backgroundColor: s.serialized.hex}}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
        <LightnessLadder
          swatches={global}
          onSelect={onSelectSwatch}
          selectedIndex={ringIndex}
        />
        <LightnessSparkline swatches={global} />
      </div>
    </>
  )
})

function numOr(prev: number, raw: string): number {
  const v = Number(raw)
  return Number.isFinite(v) ? v : prev
}

function GlobalScaleSectionInner({
  config,
  onChange,
  global,
  selectedIndex,
  onSelectSwatch,
}: Props) {
  return (
    <section id="global" className="scroll-mt-6 space-y-6">
      <header>
        <p className="eyebrow">1 · Global scale</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Neutral ladder</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Linear OKLCH lightness from light to dark; hue and chroma stay locked or shaped by the
          chroma mode. Deterministic and traceable for every step.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="ns-label">Steps</span>
          <input
            type="number"
            min={4}
            max={256}
            className="ns-input font-mono"
            value={config.steps}
            onChange={(e) => {
              const v = Number(e.target.value)
              const steps = Number.isFinite(v)
                ? Math.max(4, Math.min(256, Math.floor(v)))
                : config.steps
              onChange({...config, steps})
            }}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Lightest L (0–1)</span>
          <input
            type="number"
            step={0.005}
            className="ns-input font-mono"
            value={config.lHigh}
            onChange={(e) => onChange({...config, lHigh: numOr(config.lHigh, e.target.value)})}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Darkest L (0–1)</span>
          <input
            type="number"
            step={0.005}
            className="ns-input font-mono"
            value={config.lLow}
            onChange={(e) => onChange({...config, lLow: numOr(config.lLow, e.target.value)})}
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Hue (°)</span>
          <input
            type="number"
            className="ns-input font-mono"
            value={config.hue}
            disabled={config.variantId === 'pure' || config.chromaMode === 'achromatic'}
            onChange={(e) => onChange({...config, hue: numOr(config.hue, e.target.value)})}
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
            onChange={(e) =>
              onChange({...config, baseChroma: numOr(config.baseChroma, e.target.value)})
            }
          />
        </label>
        <label className="space-y-1">
          <span className="ns-label">Naming</span>
          <select
            className="ns-input"
            value={config.namingStyle}
            onChange={(e) => onChange({...config, namingStyle: e.target.value as NamingStyle})}
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
              onChange({...config, chromaMode: e.target.value as GlobalScaleConfig['chromaMode']})
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

      <GlobalScaleRampVisualization
        global={global}
        selectedIndex={selectedIndex}
        onSelectSwatch={onSelectSwatch}
      />
    </section>
  )
}

export const GlobalScaleSection = memo(GlobalScaleSectionInner)
