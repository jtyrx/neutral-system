'use client'

import {memo, useMemo} from 'react'

import {OffsetMapDiagram} from '@/components/viz/OffsetMapDiagram'
import {ThemeRangeBar} from '@/components/viz/ThemeRangeBar'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

type Props = {
  config: SystemMappingConfig
  onChange: (next: SystemMappingConfig) => void
  steps: number
}

function NumField({
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  hint?: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <label className="space-y-1">
      <span className="ns-label">{label}</span>
      {hint ? <span className="block text-[0.65rem] leading-snug text-white/40">{hint}</span> : null}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className="ns-input font-mono"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function ResolvedIndices({label, indices}: {label: string; indices: number[]}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
      <p className="text-[0.6rem] font-medium uppercase tracking-wide text-white/45">{label}</p>
      <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-white/80">{indices.join(', ') || '—'}</p>
    </div>
  )
}

function SystemMappingSectionInner({config, onChange, steps}: Props) {
  const n = Math.max(2, steps)

  const lightIdx = useMemo(
    () => previewResolvedRoleIndices(config, n, 'light'),
    [config, n],
  )
  const darkIdx = useMemo(
    () => previewResolvedRoleIndices(config, n, 'darkElevated'),
    [config, n],
  )

  const patch = (partial: Partial<SystemMappingConfig>) => onChange({...config, ...partial})

  return (
    <section id="system" className="scroll-mt-6 space-y-8">
      <header>
        <p className="eyebrow">2 · System mapping</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Fills, strokes & text</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          One ladder drives both themes: the fields below set shared start indices and counts. Light
          maps from the bright end; dark elevated inverts picks from the tail. The dark column shows
          the resolved indices for that theme.
        </p>
      </header>

      {/* Shared — applies to both theme derivations */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white">Shared mapping</h3>
        <p className="mt-1 text-xs text-white/45">
          Step spacing and contrast affect both Light and Dark elevated picks. Alt overlays and dark
          segment length are global.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumField
            label="Step interval"
            hint="Base step between ladder picks"
            min={1}
            max={32}
            value={config.stepInterval}
            onChange={(v) => patch({stepInterval: v})}
          />
          <NumField
            label="Contrast distance"
            hint="Widens spacing (both themes)"
            min={0.5}
            step={0.1}
            value={config.contrastDistance}
            onChange={(v) => patch({contrastDistance: v})}
          />
          <NumField
            label="Alt overlays"
            hint="Overlay token count"
            min={0}
            max={8}
            value={config.altCount}
            onChange={(v) => patch({altCount: v})}
          />
          <NumField
            label="Alt alpha"
            hint="0–1 overlay opacity"
            min={0}
            max={1}
            step={0.05}
            value={config.altAlpha}
            onChange={(v) => patch({altAlpha: v})}
          />
          <NumField
            label="Dark segment length"
            hint="Tail steps for dark UI pool"
            min={3}
            max={steps}
            value={config.darkSegmentLength}
            onChange={(v) => patch({darkSegmentLength: v})}
          />
          <label className="flex items-center gap-2 pt-6 sm:col-span-2 lg:col-span-4">
            <input
              type="checkbox"
              checked={config.includeContrastGroups}
              onChange={(e) => patch({includeContrastGroups: e.target.checked})}
              className="size-4 rounded border-white/20"
            />
            <span className="text-sm text-white/70">Include contrast groups (experimental)</span>
          </label>
        </div>
      </div>

      {/* Light vs Dark — role-grouped */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Light — editable role groups */}
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-4 sm:p-5">
          <div className="border-b border-amber-400/20 pb-3">
            <p className="eyebrow text-amber-200/80">Light theme</p>
            <h3 className="mt-1 text-base font-semibold text-white">Ladder inputs</h3>
            <p className="mt-1 text-xs text-white/50">
              Edit starts and counts. Picks move from the light end of the global ramp (low index =
              lightest).
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Fills</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Surface / background fills</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumField
                  label="Fill start index"
                  hint="First global index on ladder"
                  min={0}
                  max={steps - 1}
                  value={config.fillStart}
                  onChange={(v) => patch({fillStart: v})}
                />
                <NumField
                  label="Fill shade count"
                  hint="Number of fill tokens"
                  min={1}
                  max={16}
                  value={config.fillCount}
                  onChange={(v) => patch({fillCount: v})}
                />
              </div>
              <ResolvedIndices label="Resolved global indices (light)" indices={lightIdx.fill} />
            </div>

            <div className="space-y-3 border-t border-amber-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Strokes</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Borders & dividers</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumField
                  label="Stroke start index"
                  min={0}
                  max={steps - 1}
                  value={config.strokeStart}
                  onChange={(v) => patch({strokeStart: v})}
                />
                <NumField
                  label="Stroke shade count"
                  min={1}
                  max={16}
                  value={config.strokeCount}
                  onChange={(v) => patch({strokeCount: v})}
                />
              </div>
              <ResolvedIndices label="Resolved global indices (light)" indices={lightIdx.stroke} />
            </div>

            <div className="space-y-3 border-t border-amber-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Text</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Foreground & secondary type</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumField
                  label="Text start index"
                  min={0}
                  max={steps - 1}
                  value={config.textStart}
                  onChange={(v) => patch({textStart: v})}
                />
                <NumField
                  label="Text shade count"
                  min={1}
                  max={16}
                  value={config.textCount}
                  onChange={(v) => patch({textCount: v})}
                />
              </div>
              <ResolvedIndices label="Resolved global indices (light)" indices={lightIdx.text} />
            </div>
          </div>
        </div>

        {/* Dark elevated — read-only resolved indices per role */}
        <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.06] p-4 sm:p-5">
          <div className="border-b border-sky-400/20 pb-3">
            <p className="eyebrow text-sky-200/80">Dark elevated</p>
            <h3 className="mt-1 text-base font-semibold text-white">Resolved indices</h3>
            <p className="mt-1 text-xs text-white/50">
              Uses the same starts and counts as Light; the engine maps from the dark tail (elevated
              surfaces). Adjust values in the Light panel — this column updates.
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Fills</h4>
              <p className="text-[0.65rem] text-white/45">Inverted picks from canvas end</p>
              <ResolvedIndices label="Global indices" indices={darkIdx.fill} />
            </div>
            <div className="space-y-3 border-t border-sky-400/15 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Strokes</h4>
              <p className="text-[0.65rem] text-white/45">Stroke ladder offset</p>
              <ResolvedIndices label="Global indices" indices={darkIdx.stroke} />
            </div>
            <div className="space-y-3 border-t border-sky-400/15 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Text</h4>
              <p className="text-[0.65rem] text-white/45">Text uses offset start + 2 in dark engine</p>
              <ResolvedIndices label="Global indices" indices={darkIdx.text} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OffsetMapDiagram
          steps={steps}
          fillStart={config.fillStart}
          strokeStart={config.strokeStart}
          textStart={config.textStart}
          fillCount={config.fillCount}
          strokeCount={config.strokeCount}
          textCount={config.textCount}
        />
        <ThemeRangeBar steps={steps} darkSegmentLength={config.darkSegmentLength} />
      </div>
    </section>
  )
}

export const SystemMappingSection = memo(SystemMappingSectionInner)
