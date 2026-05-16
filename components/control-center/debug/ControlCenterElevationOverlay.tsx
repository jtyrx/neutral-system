'use client'

/**
 * Dev-only dock / page elevation tuning UI.
 * Opt-in: `?dockElevationDebug=1` or `localStorage ns:dockElevationDebug=1`.
 *
 * To extend: add a new `TuningSection` block and wire it to a new tuning atom in
 * `ControlCenterElevationProvider`. Control metadata lives inline next to each field.
 */

import {type ReactNode} from 'react'
import {SlidersHorizontal} from 'lucide-react'

import {useDockElevationTuning, type ElevationTuningValue} from '@/components/control-center/debug/ControlCenterElevationProvider'
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

// ─── Style constants ──────────────────────────────────────────────────────────

const SPREAD_MIN = 0
const SPREAD_MAX = 72

const triggerAnchorCn = 'pointer-events-none fixed bottom-24 left-3 z-60'
const triggerCn = 'pointer-events-auto size-10 rounded-full border border-hairline shadow-lg'
const popoverCn =
  'z-60 max-h-[min(80vh,36rem)] w-[min(22rem,calc(100vw-2rem))] flex-col gap-0 overflow-y-auto p-3 sm:max-h-[min(85vh,40rem)]'
const headerCn = 'flex items-center justify-between gap-2 border-b border-hairline pb-2'
const bodyCn = 'mt-2 flex flex-col gap-3'
const noteCn = 'mt-3 text-[0.6rem] leading-[1.375] text-muted'

const sectionCn =
  'rounded-lg border border-[color-mix(in_oklch,var(--chrome-hairline)_60%,transparent)] p-2'
const summaryCn = 'cursor-pointer text-[0.7rem] font-medium'
const sectionDescCn = 'mt-2 text-[0.58rem] leading-[1.375] text-muted'
const sectionBodyCn = 'mt-3 flex flex-col gap-3 pb-1'

const fieldCn = 'flex flex-col gap-1.5'
const fieldHeaderCn = 'flex justify-between gap-2 text-[0.65rem]'
const labelCn = 'text-[0.65rem] font-medium text-foreground'
const valueCn = 'font-mono text-muted tabular-nums'
const descCn = 'text-[0.58rem] leading-[1.375] text-muted'
const inputBaseCn = 'mt-1 h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs'
const checkboxRowCn = 'flex items-center gap-2 text-[0.65rem]'

// ─── Reusable control primitives ─────────────────────────────────────────────

function TuningSection({
  title,
  description,
  children,
}: {
  title: string
  description: ReactNode
  children: ReactNode
}) {
  return (
    <details open className={sectionCn}>
      <summary className={summaryCn}>{title}</summary>
      <p className={sectionDescCn}>{description}</p>
      <div className={sectionBodyCn}>{children}</div>
    </details>
  )
}

function TuningCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className={checkboxRowCn}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

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
  description?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className={fieldCn}>
      <div>
        <div className={fieldHeaderCn}>
          <span className={labelCn}>{label}</span>
          <span className={valueCn}>{value}</span>
        </div>
        {description ? <p className={descCn}>{description}</p> : null}
      </div>
      <Slider min={min} max={max} step={step} value={value} onValueChange={(v) => onChange(v[0] ?? min)} />
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
    <label className={fieldCn}>
      <span className={labelCn}>{label}</span>
      {description ? <p className={descCn}>{description}</p> : null}
      <select
        className={cn('ns-input', inputBaseCn)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  )
}

function BlurCurveSelect({value, onChange}: {value: BlurCurve; onChange: (v: BlurCurve) => void}) {
  return (
    <DescribedSelect
      label="Blur curve"
      description="How blur radii distribute across the layer stack—exponential concentrates strength in outer layers."
      value={value}
      onChange={(next) => onChange(next as BlurCurve)}
    >
      <option value="exponential">exponential</option>
      <option value="linear">linear</option>
    </DescribedSelect>
  )
}

function HaloBiasSelect({
  value,
  onChange,
}: {
  value: 'bottom' | 'uniform'
  onChange: (v: 'bottom' | 'uniform') => void
}) {
  return (
    <DescribedSelect
      label="Bias"
      description="Bottom = linear gradient from dock edge; uniform = radial ellipse for a centered glow."
      value={value}
      onChange={(next) => onChange(next as 'bottom' | 'uniform')}
    >
      <option value="bottom">bottom (dock)</option>
      <option value="uniform">uniform (popup)</option>
    </DescribedSelect>
  )
}

// ─── Form sections ────────────────────────────────────────────────────────────

function PageBlurSection({tuning}: {tuning: ElevationTuningValue}) {
  const {pageBlur, setPageBlur} = tuning
  return (
    <TuningSection
      title="Page progressive blur"
      description={
        <>
          Full-width frosted band behind the dock region. Toggle applies live to{' '}
          <span className="font-mono">PageProgressiveBlur</span>; sliders always edit the preset.
        </>
      }
    >
      <TuningCheckbox label="Apply page blur" checked={pageBlur.enabled} onChange={(v) => setPageBlur({enabled: v})} />
      <DescribedSelect
        label="Direction"
        description="Which edge the feather grows from (blur strongest at that edge, fades inward)."
        value={pageBlur.direction}
        onChange={(next) => setPageBlur({direction: next as PageProgressiveBlurDirection})}
      >
        {(['top', 'bottom', 'left', 'right'] as const).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </DescribedSelect>
      <BlurCurveSelect value={pageBlur.curve} onChange={(v) => setPageBlur({curve: v})} />
      <LabeledSlider label="Layers" description="Stacked backdrop-filter passes (more = smoother, higher GPU cost)." min={4} max={8} value={pageBlur.layerCount} onChange={(n) => setPageBlur({layerCount: n})} />
      <LabeledSlider label="Max blur (px)" description="Strongest blur radius on the outermost layer." min={4} max={32} value={pageBlur.maxBlurPx} onChange={(n) => setPageBlur({maxBlurPx: n})} />
      <LabeledSlider label="Feather height (px)" description="Thickness of the blur band perpendicular to direction." min={32} max={200} value={pageBlur.featherPx} onChange={(n) => setPageBlur({featherPx: n})} />
      <LabeledSlider label="Mask tension ×100" description="Stretches gradient mask segments (≈0.92–1.08 of nominal)." min={85} max={115} value={Math.round(pageBlur.tension * 100)} onChange={(n) => setPageBlur({tension: n / 100})} />
      <LabeledSlider label="Tint (%)" description="Washes app background color over the stack; 0 = off." min={0} max={28} value={pageBlur.tintOpacityPercent} onChange={(n) => setPageBlur({tintOpacityPercent: n})} />
      <label className={fieldCn}>
        <span className={labelCn}>Host radius (CSS)</span>
        <p className={descCn}>
          Border radius of the blur host; must match rounded corners or Chrome may clip backdrop incorrectly.
        </p>
        <input
          type="text"
          spellCheck={false}
          className={cn('ns-input', inputBaseCn, 'font-mono')}
          value={pageBlur.radius}
          placeholder="0px"
          onChange={(e) => setPageBlur({radius: e.target.value})}
        />
      </label>
    </TuningSection>
  )
}

function DockHaloSection({tuning}: {tuning: ElevationTuningValue}) {
  const {halo, setHalo} = tuning
  return (
    <TuningSection
      title="Dock halo bar"
      description={
        <>
          Backdrop halo around the <strong>collapsed</strong> dock toolbar only (
          <span className="font-mono">ElevationProgressiveBlur</span> wrapping{' '}
          <span className="font-mono">MagnifyingDockShell</span>). Spread 0 = flush with panel.
        </>
      }
    >
      <TuningCheckbox label="Apply dock halo" checked={halo.enabled} onChange={(v) => setHalo({enabled: v})} />
      <HaloBiasSelect value={halo.bias} onChange={(v) => setHalo({bias: v})} />
      <BlurCurveSelect value={halo.curve} onChange={(v) => setHalo({curve: v})} />
      <LabeledSlider label="Spread (px)" description="Outset on all sides of the halo layer. 0 = no extension beyond panel bounds." min={SPREAD_MIN} max={SPREAD_MAX} value={halo.spread} onChange={(n) => setHalo({spread: n})} />
      <LabeledSlider label="Layers" description="Stacked masked backdrop passes." min={4} max={8} value={halo.layerCount} onChange={(n) => setHalo({layerCount: n})} />
      <LabeledSlider label="Max blur (px)" description="Peak blur on the outer stack layer." min={4} max={28} value={halo.maxBlurPx} onChange={(n) => setHalo({maxBlurPx: n})} />
      <LabeledSlider label="Softness" description="Uniform bias: widens the transparent core of the radial mask." min={20} max={72} value={halo.softness} onChange={(n) => setHalo({softness: n})} />
      <LabeledSlider label="Mask tension ×100" description="Tightens or loosens linear-gradient mask stops." min={85} max={115} value={Math.round(halo.tension * 100)} onChange={(n) => setHalo({tension: n / 100})} />
    </TuningSection>
  )
}

function DockChromeSection({tuning}: {tuning: ElevationTuningValue}) {
  const {dockChrome, setDockChrome} = tuning
  return (
    <TuningSection
      title="Dock chrome"
      description={
        <>
          Inline styles on <span className="font-mono">#app-dock-panel</span>: ring + drop shadow +
          optional surface blend. Replaces default Tailwind ring/shadow when enabled.
        </>
      }
    >
      <TuningCheckbox label="Apply to dock toolbar" checked={dockChrome.enabled} onChange={(v) => setDockChrome({enabled: v})} />
      <LabeledSlider label="Shadow Y" description="Vertical offset of the drop shadow." min={0} max={28} value={dockChrome.shadowOffsetY} onChange={(n) => setDockChrome({shadowOffsetY: n})} />
      <LabeledSlider label="Shadow blur" description="Gaussian blur radius." min={4} max={48} value={dockChrome.shadowBlur} onChange={(n) => setDockChrome({shadowBlur: n})} />
      <LabeledSlider label="Shadow spread" description="Expands or contracts the shadow before blur." min={-12} max={12} value={dockChrome.shadowSpread} onChange={(n) => setDockChrome({shadowSpread: n})} />
      <LabeledSlider label="Shadow opacity ×100" description="Alpha of shadow color." min={5} max={60} value={Math.round(dockChrome.shadowOpacity * 100)} onChange={(n) => setDockChrome({shadowOpacity: n / 100})} />
      <LabeledSlider label="Surface mix %" description="Blends overlay fill into the panel—100% = full surface overlay color." min={60} max={100} value={dockChrome.surfaceMixPercent} onChange={(n) => setDockChrome({surfaceMixPercent: n})} />
      <LabeledSlider label="Ring %" description="Hairline strength: 1px outline using --ring mixed with transparent." min={0} max={45} value={dockChrome.ringOpacityPercent} onChange={(n) => setDockChrome({ringOpacityPercent: n})} />
    </TuningSection>
  )
}

function PopupHaloSection({tuning}: {tuning: ElevationTuningValue}) {
  const {popupHalo, setPopupHalo} = tuning
  return (
    <TuningSection
      title="Popup halo"
      description={
        <>
          Wraps <span className="font-mono">#dock-picker-surface</span> when the OKLCH picker is open.
          Open the picker to preview. Spread 0 = flush with card.
        </>
      }
    >
      <TuningCheckbox label="Apply to OKLCH picker" checked={popupHalo.enabled} onChange={(v) => setPopupHalo({enabled: v})} />
      <HaloBiasSelect value={popupHalo.bias} onChange={(v) => setPopupHalo({bias: v})} />
      <BlurCurveSelect value={popupHalo.curve} onChange={(v) => setPopupHalo({curve: v})} />
      <LabeledSlider label="Spread (px)" description="Outset of the halo layer around the dialog surface." min={SPREAD_MIN} max={SPREAD_MAX} value={popupHalo.spread} onChange={(n) => setPopupHalo({spread: n})} />
      <LabeledSlider label="Layers" description="Stack depth for the progressive blur mask." min={4} max={8} value={popupHalo.layerCount} onChange={(n) => setPopupHalo({layerCount: n})} />
      <LabeledSlider label="Max blur (px)" description="Strongest blur in the halo stack." min={4} max={24} value={popupHalo.maxBlurPx} onChange={(n) => setPopupHalo({maxBlurPx: n})} />
      <LabeledSlider label="Softness" description="Uniform bias: inner transparent radius of the radial mask." min={20} max={72} value={popupHalo.softness} onChange={(n) => setPopupHalo({softness: n})} />
      <LabeledSlider label="Mask tension ×100" description="Mask segment overlap / width for bottom bias." min={85} max={115} value={Math.round(popupHalo.tension * 100)} onChange={(n) => setPopupHalo({tension: n / 100})} />
    </TuningSection>
  )
}

// ─── Form shell ───────────────────────────────────────────────────────────────

function ControlCenterElevationForm({tuning}: {tuning: ElevationTuningValue}) {
  return (
    <>
      <div className={headerCn}>
        <PopoverTitle className="text-xs font-semibold">Blur &amp; dock tuning</PopoverTitle>
        <Button type="button" variant="outline" size="sm" onClick={tuning.resetAll}>Reset</Button>
      </div>

      <div className={bodyCn}>
        <PageBlurSection tuning={tuning} />
        <DockHaloSection tuning={tuning} />
        <DockChromeSection tuning={tuning} />
        <PopupHaloSection tuning={tuning} />
      </div>

      <p className={noteCn}>
        Opt-in: <span className="font-mono">?dockElevationDebug=1</span> or{' '}
        <span className="font-mono">localStorage ns:dockElevationDebug=1</span>. Development only.
      </p>
    </>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ControlCenterElevationOverlay() {
  const tuning = useDockElevationTuning()
  return (
    <Popover>
      <div data-slot="dock-elevation-dev-overlay" className={triggerAnchorCn}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className={triggerCn}
            aria-label="Open blur tuning (development)"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent side="top" align="start" sideOffset={10} className={popoverCn}>
        <ControlCenterElevationForm tuning={tuning} />
      </PopoverContent>
    </Popover>
  )
}
