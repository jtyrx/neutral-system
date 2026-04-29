'use client'

import { memo, useMemo } from 'react'

import { OffsetMapDiagram } from '@/components/viz/OffsetMapDiagram'
import { ThemeRangeBar } from '@/components/viz/ThemeRangeBar'
import { previewResolvedRoleIndices } from '@/lib/neutral-engine/systemMap'
import {
  BORDER_STANDARD_SLOT_COUNT,
  SURFACE_STANDARD_COUNT_MAX,
} from '@/lib/neutral-engine/semanticNaming'
import type { ContrastEmphasis, SystemMappingConfig } from '@/lib/neutral-engine'

type Props = {
  /** Raw workbench state — bound to inputs. */
  config: SystemMappingConfig
  /**
   * Deferred mapping + contrast emphasis — **must** match `deriveSystemTokens` (same as
   * `effectiveMappingConfig` from the workbench hook).
   */
  derivationConfig: SystemMappingConfig
  contrastEmphasis: ContrastEmphasis
  patchSystem: <K extends keyof SystemMappingConfig>(
    key: K,
    value: SystemMappingConfig[K],
    label?: string,
  ) => void
  steps: number
  alphaBaseIndices?: {lightBase: number; darkBase: number}
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
      {hint ? <span className="block text-[0.65rem] leading-snug text-disabled">{hint}</span> : null}
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

function ResolvedIndices({ label, indices }: { label: string; indices: number[] }) {
  return (
    <div className="rounded-lg border border-hairline bg-raised px-3 py-2">
      <p className="text-[0.6rem] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-default">{indices.join(', ') || '—'}</p>
    </div>
  )
}

function SystemMappingSectionInner({
  config,
  derivationConfig,
  contrastEmphasis,
  patchSystem,
  steps,
  alphaBaseIndices,
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
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-default">Surface, border & text</h2>
        <p className="mt-2 max-w-2xl text-sm text-default/55">
          Light and Dark elevated each have their own ladder starts and shade counts on the shared
          global ramp. Resolved indices and offset maps use the same math as previews and exports,
          including the preview toolbar’s{' '}
          <span className="font-mono text-subtle">{contrastEmphasis}</span> contrast emphasis (inverse
          widens ladder spacing the most).
        </p>
      </header>

      <div className="rounded-sm border border-hairline bg-(--ns-overlay-soft) px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="text-sm font-semibold text-default">Shared mapping</h3>
        <p className="mt-1 text-xs text-muted">
          Contrast distance applies to both themes (scaled by emphasis in the preview toolbar). Step
          interval is set per theme and role in each ladder group below. Alt overlays and dark segment
          length are global.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 nsb-lg:grid-cols-4">
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
          <label className="flex items-center gap-2 pt-6 sm:col-span-2 nsb-lg:col-span-4">
            <input
              type="checkbox"
              checked={config.includeContrastGroups}
              onChange={(e) => patchSystem('includeContrastGroups', e.target.checked)}
              className="size-4 rounded border-hairline-strong"
            />
            <span className="text-sm text-subtle">Include contrast groups (experimental)</span>
          </label>
        </div>
      </div>

      <div
        id="light-theme-role-ladders"
        className="grid gap-4 nsb-lg:grid-cols-2 nsb-lg:gap-6"
      >
        <div className="rounded-2xl border border-(--chrome-amber-border) bg-(--chrome-amber-surface) p-4 sm:p-5 flex flex-col justify-between">
          <div className="border-b border-(--chrome-amber-border-soft) pb-3">
            <p className="eyebrow text-(--chrome-amber-text)">Light theme</p>
            <h3 className="mt-1 text-base font-semibold text-default">Role ladders</h3>
            <p className="mt-1 text-xs text-muted">
              Picks step along the global ramp from the light end (low index = lightest).
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-amber-text)">Surface</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Surface / background ramp</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
                <NumField
                  label="Step interval"
                  hint="Surface · × contrast distance"
                  min={1}
                  max={32}
                  value={config.lightFillStepInterval}
                  onChange={(v) => patchSystem('lightFillStepInterval', v)}
                />
                <NumField
                  label="Surface start index"
                  hint="First global index on ladder"
                  min={0}
                  max={steps - 1}
                  value={config.fillStart}
                  onChange={(v) => patchSystem('fillStart', v)}
                />
                <NumField
                  label="Surface token count"
                  hint="Standard elevation ladder (sunken → overlay, max 5). surface.inverse is auto, not counted."
                  min={2}
                  max={SURFACE_STANDARD_COUNT_MAX}
                  value={config.fillCount}
                  onChange={(v) => patchSystem('fillCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.surface} />
            </div>

            <div className="space-y-3 border-t border-(--chrome-amber-border-faint) pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-amber-text)">Border</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Borders & dividers</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
                <NumField
                  label="Step interval"
                  hint="Border · × contrast distance"
                  min={1}
                  max={32}
                  value={config.lightStrokeStepInterval}
                  onChange={(v) => patchSystem('lightStrokeStepInterval', v)}
                />
                <NumField
                  label="Border start index"
                  min={0}
                  max={steps - 1}
                  value={config.strokeStart}
                  onChange={(v) => patchSystem('strokeStart', v)}
                />
                <NumField
                  label="Border token count"
                  hint="Ladder: default / subtle / strong (max 3). border.focus is a max-contrast flip, auto-emitted."
                  min={1}
                  max={BORDER_STANDARD_SLOT_COUNT}
                  value={config.strokeCount}
                  onChange={(v) => patchSystem('strokeCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.border} />
            </div>

            <div className="space-y-3 border-t border-(--chrome-amber-border-faint) pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-amber-text)">Text</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Foreground & secondary type</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
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
                  hint="Standard ladder (default → disabled). text.on is mirrored from default, not counted."
                  min={1}
                  max={4}
                  value={config.textCount}
                  onChange={(v) => patchSystem('textCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={lightIdx.text} />
            </div>
          </div>
        </div>

        <div
          id="dark-theme-role-ladders"
          className="rounded-2xl border border-(--chrome-sky-border) bg-(--chrome-sky-surface) p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="border-b border-(--chrome-sky-border-soft) pb-3">
            <p className="eyebrow text-(--chrome-sky-text)">Dark elevated</p>
            <h3 className="mt-1 text-base font-semibold text-default">Role ladders</h3>
            <p className="mt-1 text-xs text-muted">
              Independent controls; surfaces anchor from the dark edge of the shared ramp, while
              border and text keep their own dark-theme start inputs and resolved global indices.
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-sky-text)">Surface</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Dark-edge anchored surface ramp</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
                <NumField
                  label="Step interval"
                  hint="Surface · × contrast distance"
                  min={1}
                  max={32}
                  value={config.darkFillStepInterval}
                  onChange={(v) => patchSystem('darkFillStepInterval', v)}
                />
                <NumField
                  label="Surface start index"
                  hint="0 starts at the dark-edge swatch; higher values walk inward along the shared ramp."
                  min={0}
                  max={steps - 1}
                  value={config.darkFillStart}
                  onChange={(v) => patchSystem('darkFillStart', v)}
                />
                <NumField
                  label="Surface token count"
                  hint="Standard elevation ladder (sunken → overlay, max 5). surface.inverse is auto, not counted."
                  min={2}
                  max={SURFACE_STANDARD_COUNT_MAX}
                  value={config.darkFillCount}
                  onChange={(v) => patchSystem('darkFillCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={darkIdx.surface} />
            </div>

            <div className="space-y-3 border-t border-(--chrome-sky-border-faint) pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-sky-text)">Border</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Hairline / divider ramp</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
                <NumField
                  label="Step interval"
                  hint="Border · × contrast distance"
                  min={1}
                  max={32}
                  value={config.darkStrokeStepInterval}
                  onChange={(v) => patchSystem('darkStrokeStepInterval', v)}
                />
                <NumField
                  label="Border start index"
                  min={0}
                  max={steps - 1}
                  value={config.darkStrokeStart}
                  onChange={(v) => patchSystem('darkStrokeStart', v)}
                />
                <NumField
                  label="Border token count"
                  hint="Ladder: default / subtle / strong (max 3). border.focus is auto-emitted."
                  min={1}
                  max={BORDER_STANDARD_SLOT_COUNT}
                  value={config.darkStrokeCount}
                  onChange={(v) => patchSystem('darkStrokeCount', v)}
                />
              </div>
              <ResolvedIndices label="Resolved global indices" indices={darkIdx.border} />
            </div>

            <div className="space-y-3 border-t border-(--chrome-sky-border-faint) pt-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-(--chrome-sky-text)">Text</h4>
                <p className="mt-0.5 text-[0.65rem] text-muted">Type ramp (stroke-text picker)</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
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
                  hint="Standard ladder (default → disabled). text.on is mirrored from default, not counted."
                  min={1}
                  max={4}
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
        <div className="grid gap-4 nsb-lg:grid-cols-1">
          <OffsetMapDiagram
            steps={steps}
            themeLabel="Light"
            description="Bars use the same resolved global indices as light themeMode tokens (low index = light)."
            surfaceIndices={lightIdx.surface}
            borderIndices={lightIdx.border}
            textIndices={lightIdx.text}
            alphaBaseIndex={alphaBaseIndices?.lightBase}
          />
          <OffsetMapDiagram
            steps={steps}
            themeLabel="Dark elevated"
            description="Bars use the same resolved global indices as darkElevated themeMode tokens (tail-anchored picks)."
            surfaceIndices={darkIdx.surface}
            borderIndices={darkIdx.border}
            textIndices={darkIdx.text}
            alphaBaseIndex={alphaBaseIndices?.darkBase}
          />
        </div>
        <ThemeRangeBar steps={steps} darkSegmentLength={config.darkSegmentLength} />
      </div>
    </section>
  )
}

export const SystemMappingSection = memo(SystemMappingSectionInner)
