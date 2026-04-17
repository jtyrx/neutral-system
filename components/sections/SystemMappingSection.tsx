'use client'

import {memo, useMemo} from 'react'

import {OffsetMapDiagram} from '@/components/viz/OffsetMapDiagram'
import {ThemeRangeBar} from '@/components/viz/ThemeRangeBar'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

type Props = {
  /** Raw workbench state — bound to inputs. */
  config: SystemMappingConfig
  /**
   * Deferred mapping + compact/wide contrast — **must** match `deriveSystemTokens` (same as
   * `effectiveMappingConfig` from the workbench hook).
   */
  derivationConfig: SystemMappingConfig
  contrastMode: 'compact' | 'wide'
  patchSystem: <K extends keyof SystemMappingConfig>(key: K, value: SystemMappingConfig[K]) => void
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

function SystemMappingSectionInner({
  config,
  derivationConfig,
  contrastMode,
  patchSystem,
  steps,
}: Props) {
  const n = Math.max(2, steps)

  const lightIdx = useMemo(
    () => previewResolvedRoleIndices(derivationConfig, n, 'light'),
    [derivationConfig, n],
  )
  const darkIdx = useMemo(
    () => previewResolvedRoleIndices(derivationConfig, n, 'darkElevated'),
    [derivationConfig, n],
  )

  return (
    <section id="system" className="scroll-mt-6 space-y-8">
      <header>
        <p className="eyebrow">2 · System mapping</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Fills, strokes & text</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Light and Dark elevated each have their own ladder starts and shade counts on the shared
          global ramp. Resolved indices and offset maps use the same math as previews and exports,
          including the preview toolbar’s <span className="font-mono text-white/70">{contrastMode}</span>{' '}
          contrast mode (wide widens ladder spacing).
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white">Shared mapping</h3>
        <p className="mt-1 text-xs text-white/45">
          Contrast distance applies to both themes (× wide boost when the preview is in wide mode).
          Step interval is set per theme and role in each ladder group below. Alt overlays and dark
          segment length are global.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumField
            label="Contrast distance"
            hint="Widens spacing (both themes)"
            min={0.5}
            step={0.1}
            value={config.contrastDistance}
            onChange={(v) => patchSystem('contrastDistance', v)}
          />
          <NumField
            label="Alt overlays"
            hint="Overlay token count"
            min={0}
            max={8}
            value={config.altCount}
            onChange={(v) => patchSystem('altCount', v)}
          />
          <NumField
            label="Alt alpha"
            hint="0–1 overlay opacity"
            min={0}
            max={1}
            step={0.05}
            value={config.altAlpha}
            onChange={(v) => patchSystem('altAlpha', v)}
          />
          <NumField
            label="Dark segment length"
            hint="Tail steps for dark UI pool"
            min={3}
            max={steps}
            value={config.darkSegmentLength}
            onChange={(v) => patchSystem('darkSegmentLength', v)}
          />
          <label className="flex items-center gap-2 pt-6 sm:col-span-2 lg:col-span-4">
            <input
              type="checkbox"
              checked={config.includeContrastGroups}
              onChange={(e) => patchSystem('includeContrastGroups', e.target.checked)}
              className="size-4 rounded border-white/20"
            />
            <span className="text-sm text-white/70">Include contrast groups (experimental)</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-4 sm:p-5">
          <div className="border-b border-amber-400/20 pb-3">
            <p className="eyebrow text-amber-200/80">Light theme</p>
            <h3 className="mt-1 text-base font-semibold text-white">Role ladders</h3>
            <p className="mt-1 text-xs text-white/50">
              Picks step along the global ramp from the light end (low index = lightest).
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Fills</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Surface / background fills</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Fills · × contrast distance"
                  min={1}
                  max={32}
                  value={config.lightFillStepInterval}
                  onChange={(v) => patchSystem('lightFillStepInterval', v)}
                />
                <NumField
                  label="Fill start index"
                  hint="First global index on ladder"
                  min={0}
                  max={steps - 1}
                  value={config.fillStart}
                  onChange={(v) => patchSystem('fillStart', v)}
                />
                <NumField
                  label="Fill shade count"
                  hint="Number of fill tokens"
                  min={1}
                  max={16}
                  value={config.fillCount}
                  onChange={(v) => patchSystem('fillCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.fill} />
            </div>

            <div className="space-y-3 border-t border-amber-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Strokes</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Borders & dividers</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Strokes · × contrast distance"
                  min={1}
                  max={32}
                  value={config.lightStrokeStepInterval}
                  onChange={(v) => patchSystem('lightStrokeStepInterval', v)}
                />
                <NumField
                  label="Stroke start index"
                  min={0}
                  max={steps - 1}
                  value={config.strokeStart}
                  onChange={(v) => patchSystem('strokeStart', v)}
                />
                <NumField
                  label="Stroke shade count"
                  min={1}
                  max={16}
                  value={config.strokeCount}
                  onChange={(v) => patchSystem('strokeCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.stroke} />
            </div>

            <div className="space-y-3 border-t border-amber-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Text</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Foreground & secondary type</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Text · × contrast distance"
                  min={1}
                  max={32}
                  value={config.lightTextStepInterval}
                  onChange={(v) => patchSystem('lightTextStepInterval', v)}
                />
                <NumField
                  label="Text start index"
                  min={0}
                  max={steps - 1}
                  value={config.textStart}
                  onChange={(v) => patchSystem('textStart', v)}
                />
                <NumField
                  label="Text shade count"
                  min={1}
                  max={16}
                  value={config.textCount}
                  onChange={(v) => patchSystem('textCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.text} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.06] p-4 sm:p-5">
          <div className="border-b border-sky-400/20 pb-3">
            <p className="eyebrow text-sky-200/80">Dark elevated</p>
            <h3 className="mt-1 text-base font-semibold text-white">Role ladders</h3>
            <p className="mt-1 text-xs text-white/50">
              Independent controls; the engine maps from the dark tail using the same inverted
              index rules as before (fills, strokes, and text each use their own start inputs).
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Fills</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Tail-anchored surface ramp</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Fills · × contrast distance"
                  min={1}
                  max={32}
                  value={config.darkFillStepInterval}
                  onChange={(v) => patchSystem('darkFillStepInterval', v)}
                />
                <NumField
                  label="Fill start index"
                  hint="Offset into dark tail pool"
                  min={0}
                  max={steps - 1}
                  value={config.darkFillStart}
                  onChange={(v) => patchSystem('darkFillStart', v)}
                />
                <NumField
                  label="Fill shade count"
                  min={1}
                  max={16}
                  value={config.darkFillCount}
                  onChange={(v) => patchSystem('darkFillCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={darkIdx.fill} />
            </div>

            <div className="space-y-3 border-t border-sky-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Strokes</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Hairline / divider ramp</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Strokes · × contrast distance"
                  min={1}
                  max={32}
                  value={config.darkStrokeStepInterval}
                  onChange={(v) => patchSystem('darkStrokeStepInterval', v)}
                />
                <NumField
                  label="Stroke start index"
                  min={0}
                  max={steps - 1}
                  value={config.darkStrokeStart}
                  onChange={(v) => patchSystem('darkStrokeStart', v)}
                />
                <NumField
                  label="Stroke shade count"
                  min={1}
                  max={16}
                  value={config.darkStrokeCount}
                  onChange={(v) => patchSystem('darkStrokeCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={darkIdx.stroke} />
            </div>

            <div className="space-y-3 border-t border-sky-400/15 pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">Text</h4>
                <p className="mt-0.5 text-[0.65rem] text-white/45">Type ramp (stroke-text picker)</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumField
                  label="Step interval"
                  hint="Text · × contrast distance"
                  min={1}
                  max={32}
                  value={config.darkTextStepInterval}
                  onChange={(v) => patchSystem('darkTextStepInterval', v)}
                />
                <NumField
                  label="Text start index"
                  min={0}
                  max={steps - 1}
                  value={config.darkTextStart}
                  onChange={(v) => patchSystem('darkTextStart', v)}
                />
                <NumField
                  label="Text shade count"
                  min={1}
                  max={16}
                  value={config.darkTextCount}
                  onChange={(v) => patchSystem('darkTextCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={darkIdx.text} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-1">
          <OffsetMapDiagram
            steps={steps}
            themeLabel="Light"
            description="Bars use the same resolved global indices as light themeMode tokens (low index = light)."
            fillIndices={lightIdx.fill}
            strokeIndices={lightIdx.stroke}
            textIndices={lightIdx.text}
          />
          <OffsetMapDiagram
            steps={steps}
            themeLabel="Dark elevated"
            description="Bars use the same resolved global indices as darkElevated themeMode tokens (tail-anchored picks)."
            fillIndices={darkIdx.fill}
            strokeIndices={darkIdx.stroke}
            textIndices={darkIdx.text}
          />
        </div>
        <ThemeRangeBar steps={steps} darkSegmentLength={config.darkSegmentLength} />
      </div>
    </section>
  )
}

export const SystemMappingSection = memo(SystemMappingSectionInner)
