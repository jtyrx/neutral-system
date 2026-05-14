'use client'

/**
 * Dev-only dock / page elevation tuning UI.
 *
 * **Refactor ideas (for later):**
 * - Move control metadata (min/max/step, labels, descriptions) into a small schema
 *   (e.g. `dockElevationTuningSchema.ts`) and map over it to reduce JSX duplication.
 * - Optional localStorage persistence when the debug gate is on, so tuning survives refresh.
 * - Split into `PageBlurTuningForm`, `DockHaloTuningForm`, etc. if this file grows again.
 */

import {type ReactNode} from 'react'
import {SlidersHorizontal} from 'lucide-react'

import {useDockElevationTuning} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {Button} from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {Slider} from '@/components/ui/slider'
import type {PageProgressiveBlurDirection} from '@/components/ui/page-progressive-blur'
import type {BlurCurve} from '@/lib/effects/progressiveBlurStack'
import {cn} from '@/lib/utils'

const SPREAD_MIN = 0
const SPREAD_MAX = 72

function LabeledSlider({
  label,
  description,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string
  /** One short sentence; appears under the label. */
  description?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="cc-debug-field">
      <div>
        <div className="cc-debug-field-header">
          <span className="cc-debug-label">{label}</span>
          <span className="cc-debug-value">{value}</span>
        </div>
        {description ? (
          <p className="cc-debug-description">{description}</p>
        ) : null}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
    </div>
  )
}

function DescribedSelect({
  label,
  description,
  value,
  onChange,
  children,
}: {
  label: string
  description?: string
  value: string
  onChange: (next: string) => void
  children: ReactNode
}) {
  return (
    <label className="cc-debug-field">
      <span className="cc-debug-label">{label}</span>
      {description ? (
        <p className="cc-debug-description">{description}</p>
      ) : null}
      <select
        className="ns-input cc-debug-input-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  )
}

type Tuning = ReturnType<typeof useDockElevationTuning>

function ControlCenterElevationForm({
  pageBlur,
  setPageBlur,
  halo,
  setHalo,
  dockChrome,
  setDockChrome,
  popupHalo,
  setPopupHalo,
  resetAll,
}: Tuning) {
  return (
    <>
      <div className="cc-debug-header">
        <PopoverTitle className="text-xs font-semibold">
          Blur &amp; dock tuning
        </PopoverTitle>
        <Button type="button" variant="outline" size="sm" onClick={resetAll}>
          Reset
        </Button>
      </div>

      <div className="cc-debug-body">
        <details open className="cc-debug-section">
          <summary className="cc-debug-summary">
            Page progressive blur
          </summary>
          <p className="cc-debug-section-description">
            Full-width frosted band behind the dock region (above the strip). Toggle applies
            live to <span className="font-mono">PageProgressiveBlur</span>; sliders always edit
            the preset.
          </p>
          <div className="cc-debug-section-body">
            <label className="cc-debug-checkbox-row">
              <input
                type="checkbox"
                checked={pageBlur.enabled}
                onChange={(e) => setPageBlur({enabled: e.target.checked})}
              />
              Apply page blur
            </label>
            <DescribedSelect
              label="Direction"
              description="Which edge the feather grows from (blur strongest at that edge, fades inward)."
              value={pageBlur.direction}
              onChange={(next) =>
                setPageBlur({direction: next as PageProgressiveBlurDirection})
              }
            >
              {(['top', 'bottom', 'left', 'right'] as const).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </DescribedSelect>
            <DescribedSelect
              label="Blur curve"
              description="How strongly blur ramps across stacked layers—exponential concentrates strength in outer layers."
              value={pageBlur.curve}
              onChange={(next) => setPageBlur({curve: next as BlurCurve})}
            >
              <option value="exponential">exponential</option>
              <option value="linear">linear</option>
            </DescribedSelect>
            <LabeledSlider
              label="Layers"
              description="Number of stacked backdrop-filter passes (more = smoother falloff, higher GPU cost)."
              min={4}
              max={8}
              value={pageBlur.layerCount}
              onChange={(n) => setPageBlur({layerCount: n})}
            />
            <LabeledSlider
              label="Max blur (px)"
              description="Strongest blur radius used on the outermost layer; inner layers scale down from this."
              min={4}
              max={32}
              value={pageBlur.maxBlurPx}
              onChange={(n) => setPageBlur({maxBlurPx: n})}
            />
            <LabeledSlider
              label="Feather height (px)"
              description="Thickness of the blur band perpendicular to direction (host element height or width)."
              min={32}
              max={200}
              value={pageBlur.featherPx}
              onChange={(n) => setPageBlur({featherPx: n})}
            />
            <LabeledSlider
              label="Mask tension ×100"
              description="Stretches gradient mask segments (≈0.92–1.08 of nominal)—higher overlaps plateaus slightly to hide seams."
              min={85}
              max={115}
              value={Math.round(pageBlur.tension * 100)}
              onChange={(n) => setPageBlur({tension: n / 100})}
            />
            <LabeledSlider
              label="Tint (%)"
              description="Washes app background color over the stack for readability; 0 = tint off."
              min={0}
              max={28}
              value={pageBlur.tintOpacityPercent}
              onChange={(n) => setPageBlur({tintOpacityPercent: n})}
            />
            <label className="cc-debug-field">
              <span className="cc-debug-label">Host radius (CSS)</span>
              <p className="cc-debug-description">
                Border radius of the blur host; must match rounded corners or Chrome may clip
                backdrop incorrectly.
              </p>
              <input
                type="text"
                spellCheck={false}
                className="ns-input cc-debug-input-base cc-debug-text-input"
                value={pageBlur.radius}
                placeholder="0px"
                onChange={(e) => setPageBlur({radius: e.target.value})}
              />
            </label>
          </div>
        </details>

        <details open className="cc-debug-section">
          <summary className="cc-debug-summary">
            Dock halo bar
          </summary>
          <p className="cc-debug-section-description">
            Backdrop halo around the <strong>collapsed</strong> dock toolbar only (
            <span className="font-mono">ElevationProgressiveBlur</span> wrapping{' '}
            <span className="font-mono">MagnifyingDockShell</span>). Spread 0 keeps the halo box
            flush with the panel (no outward bleed).
          </p>
          <div className="cc-debug-section-body">
            <label className="cc-debug-checkbox-row">
              <input
                type="checkbox"
                checked={halo.enabled}
                onChange={(e) => setHalo({enabled: e.target.checked})}
              />
              Apply dock halo
            </label>
            <DescribedSelect
              label="Bias"
              description="Bottom = linear gradient from dock edge (strong along bottom); uniform = radial ellipse for a centered glow."
              value={halo.bias}
              onChange={(next) =>
                setHalo({bias: next as 'bottom' | 'uniform'})
              }
            >
              <option value="bottom">bottom (dock)</option>
              <option value="uniform">uniform (popup)</option>
            </DescribedSelect>
            <DescribedSelect
              label="Blur curve"
              description="Same as page blur: how blur radii distribute across the layer stack."
              value={halo.curve}
              onChange={(next) => setHalo({curve: next as BlurCurve})}
            >
              <option value="exponential">exponential</option>
              <option value="linear">linear</option>
            </DescribedSelect>
            <LabeledSlider
              label="Spread (px)"
              description="Outset on all sides of the halo layer (negative inset). Larger values need viewport overflow visible—0 = no extension beyond the panel bounds."
              min={SPREAD_MIN}
              max={SPREAD_MAX}
              value={halo.spread}
              onChange={(n) => setHalo({spread: n})}
            />
            <LabeledSlider
              label="Layers"
              description="Stacked masked backdrop passes shaping the halo."
              min={4}
              max={8}
              value={halo.layerCount}
              onChange={(n) => setHalo({layerCount: n})}
            />
            <LabeledSlider
              label="Max blur (px)"
              description="Peak blur on the outer stack layer; inner layers scale down."
              min={4}
              max={28}
              value={halo.maxBlurPx}
              onChange={(n) => setHalo({maxBlurPx: n})}
            />
            <LabeledSlider
              label="Softness"
              description="Uniform bias only: widens the transparent core of the radial mask (softer falloff)."
              min={20}
              max={72}
              value={halo.softness}
              onChange={(n) => setHalo({softness: n})}
            />
            <LabeledSlider
              label="Mask tension ×100"
              description="Tightens or loosens linear-gradient mask stops (bottom bias); also affects uniform radial shaping indirectly via stack index."
              min={85}
              max={115}
              value={Math.round(halo.tension * 100)}
              onChange={(n) => setHalo({tension: n / 100})}
            />
          </div>
        </details>

        <details open className="cc-debug-section">
          <summary className="cc-debug-summary">
            Dock chrome
          </summary>
          <p className="cc-debug-section-description">
            Inline styles on <span className="font-mono">#app-dock-panel</span>: ring plus drop
            shadow and optional surface blend. Replaces default Tailwind ring/shadow when apply is
            on.
          </p>
          <div className="cc-debug-section-body">
            <label className="cc-debug-checkbox-row">
              <input
                type="checkbox"
                checked={dockChrome.enabled}
                onChange={(e) => setDockChrome({enabled: e.target.checked})}
              />
              Apply to dock toolbar
            </label>
            <LabeledSlider
              label="Shadow Y"
              description="Vertical offset of the drop shadow (positive pushes shadow downward)."
              min={0}
              max={28}
              value={dockChrome.shadowOffsetY}
              onChange={(n) => setDockChrome({shadowOffsetY: n})}
            />
            <LabeledSlider
              label="Shadow blur"
              description="Gaussian blur radius of the drop shadow."
              min={4}
              max={48}
              value={dockChrome.shadowBlur}
              onChange={(n) => setDockChrome({shadowBlur: n})}
            />
            <LabeledSlider
              label="Shadow spread"
              description="Expands or contracts the shadow shape before blur (negative tightens)."
              min={-12}
              max={12}
              value={dockChrome.shadowSpread}
              onChange={(n) => setDockChrome({shadowSpread: n})}
            />
            <LabeledSlider
              label="Shadow opacity ×100"
              description="Alpha of the shadow color only (ring uses separate mixing below)."
              min={5}
              max={60}
              value={Math.round(dockChrome.shadowOpacity * 100)}
              onChange={(n) => setDockChrome({shadowOpacity: n / 100})}
            />
            <LabeledSlider
              label="Surface mix %"
              description="Blends semantic overlay fill into the panel—100% uses full surface overlay color."
              min={60}
              max={100}
              value={dockChrome.surfaceMixPercent}
              onChange={(n) => setDockChrome({surfaceMixPercent: n})}
            />
            <LabeledSlider
              label="Ring %"
              description="Hairline strength: 1px outline using --ring mixed with transparent."
              min={0}
              max={45}
              value={dockChrome.ringOpacityPercent}
              onChange={(n) => setDockChrome({ringOpacityPercent: n})}
            />
          </div>
        </details>

        <details open className="cc-debug-section">
          <summary className="cc-debug-summary">
            Popup halo
          </summary>
          <p className="cc-debug-section-description">
            Wraps <span className="font-mono">#dock-picker-surface</span> when the OKLCH picker
            is open. Open the picker to preview. Spread 0 aligns the halo bounds with the card
            (no extra bleed).
          </p>
          <div className="cc-debug-section-body">
            <label className="cc-debug-checkbox-row">
              <input
                type="checkbox"
                checked={popupHalo.enabled}
                onChange={(e) => setPopupHalo({enabled: e.target.checked})}
              />
              Apply to OKLCH picker
            </label>
            <DescribedSelect
              label="Bias"
              description="Same as dock halo: bottom gradient vs radial uniform popup."
              value={popupHalo.bias}
              onChange={(next) =>
                setPopupHalo({bias: next as 'bottom' | 'uniform'})
              }
            >
              <option value="bottom">bottom (dock-anchored)</option>
              <option value="uniform">uniform (radial popup)</option>
            </DescribedSelect>
            <DescribedSelect
              label="Blur curve"
              description="Layer stack blur distribution."
              value={popupHalo.curve}
              onChange={(next) => setPopupHalo({curve: next as BlurCurve})}
            >
              <option value="exponential">exponential</option>
              <option value="linear">linear</option>
            </DescribedSelect>
            <LabeledSlider
              label="Spread (px)"
              description="Outset of the halo layer around the dialog surface; increase for a wider frosted halo, 0 for none."
              min={SPREAD_MIN}
              max={SPREAD_MAX}
              value={popupHalo.spread}
              onChange={(n) => setPopupHalo({spread: n})}
            />
            <LabeledSlider
              label="Layers"
              description="Stack depth for the progressive blur mask."
              min={4}
              max={8}
              value={popupHalo.layerCount}
              onChange={(n) => setPopupHalo({layerCount: n})}
            />
            <LabeledSlider
              label="Max blur (px)"
              description="Strongest blur in the halo stack."
              min={4}
              max={24}
              value={popupHalo.maxBlurPx}
              onChange={(n) => setPopupHalo({maxBlurPx: n})}
            />
            <LabeledSlider
              label="Softness"
              description="Uniform bias: inner transparent radius of the radial mask."
              min={20}
              max={72}
              value={popupHalo.softness}
              onChange={(n) => setPopupHalo({softness: n})}
            />
            <LabeledSlider
              label="Mask tension ×100"
              description="Mask segment overlap / width for bottom bias; tweaks edge softness."
              min={85}
              max={115}
              value={Math.round(popupHalo.tension * 100)}
              onChange={(n) => setPopupHalo({tension: n / 100})}
            />
          </div>
        </details>
      </div>

      <p className="cc-debug-note">
        Opt-in: <span className="font-mono">?dockElevationDebug=1</span> or{' '}
        <span className="font-mono">localStorage ns:dockElevationDebug=1</span>. Development
        only.
      </p>
    </>
  )
}

/**
 * Dev-only: floating trigger opens a popover with all progressive-blur and dock controls.
 * Opt-in: `?dockElevationDebug=1` or localStorage `ns:dockElevationDebug=1`.
 */
export function ControlCenterElevationOverlay() {
  const tuning = useDockElevationTuning()
  return (
    <Popover>
      <div
        data-slot="dock-elevation-dev-overlay"
        className="cc-debug-trigger-anchor"
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="cc-debug-trigger"
            aria-label="Open blur tuning (development)"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className={cn(
          'cc-debug-popover',
        )}
      >
        <ControlCenterElevationForm {...tuning} />
      </PopoverContent>
    </Popover>
  )
}
