'use client'

import {memo} from 'react'

import {BrandColorSection} from '@/components/sections/BrandColorSection'
import {ExportSection} from '@/components/sections/ExportSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSection} from '@/components/sections/OkhslSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {AdditionalInfoPreviewCard} from '@/components/ui/preview-card'
import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {DEFAULT_GLOBAL} from '@/hooks/useNeutralWorkbench'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {cn} from '@/lib/cn'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Grouped controls: Scale → Mapping → Inspect → Export. */
function BuilderControlsSectionsInner({wb, selectedGlobalIndex}: Props) {
  const simpleArch = wb.neutralArchitecture === 'simple'

  const activeScalePatch = simpleArch ? wb.patchGlobal : wb.scaleEditTarget === 'dark' ? wb.patchDark : wb.patchLight
  const activeScaleConfig =
    simpleArch ? wb.globalScale : wb.scaleEditTarget === 'dark' ? wb.darkScale : wb.lightScale
  const activeRampVisual =
    simpleArch ? wb.global : wb.scaleEditTarget === 'dark' ? wb.darkRamp : wb.lightRamp
  return (
    <div className="flex flex-col gap-4 pb-12">
      <CollapsibleControlGroup
        id="neutral-workbench-controls-scale"
        title={simpleArch ? 'Global neutral scale ladder' : 'Neutral scale ladders'}
        subtitle={
          simpleArch
            ? 'Steps, lightness range, chroma shaping, and hue variants.'
            : 'Independent light / dark ramps — pick which ladder you edit, then tweak steps and chroma.'
        }
        additionalInfo={
          <AdditionalInfoPreviewCard additionalInfo="How this ladder works">
            <p className="max-w-2xl text-sm text-muted">
              Linear OKLCH lightness from light to dark (8–48 steps; default 41). Hue and chroma stay locked or shaped by the chroma mode. Tier-1 primitives feed semantic tokens.
            </p>
          </AdditionalInfoPreviewCard>
        }
        defaultOpen
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-default">Architecture</p>
            <p className="mt-1 text-[0.65rem] text-muted">
              Simple mirrors one ramp into both themes by mapping. Advanced keeps independent ramps for optics.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => wb.setNeutralArchitecture('simple')}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  simpleArch ? 'border-(--chrome-amber-border) bg-(--chrome-amber-pill)' : 'border-hairline bg-(--ns-chip)',
                )}
              >
                Simple · single ladder
              </button>
              <button
                type="button"
                onClick={() => wb.setNeutralArchitecture('advanced')}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  !simpleArch ? 'border-(--chrome-sky-border) bg-(--chrome-sky-pill)' : 'border-hairline bg-(--ns-chip)',
                )}
              >
                Advanced · sibling ramps
              </button>
            </div>
          </div>

          {!simpleArch ? (
            <div>
              <p className="text-xs font-medium text-default">Edit target ramp</p>
              <p className="mt-1 text-[0.65rem] text-muted">
                Hue variants and OKHSL commits apply here. Inspect the other ramp visually in previews.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => wb.setScaleEditTarget('light')}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    wb.scaleEditTarget === 'light'
                      ? 'border-(--chrome-amber-border) bg-(--chrome-amber-surface-soft)'
                      : 'border-hairline bg-(--ns-chip)',
                  )}
                >
                  Light ramp
                </button>
                <button
                  type="button"
                  onClick={() => wb.setScaleEditTarget('dark')}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    wb.scaleEditTarget === 'dark'
                      ? 'border-(--chrome-sky-border) bg-(--chrome-sky-surface-soft)'
                      : 'border-hairline bg-(--ns-chip)',
                  )}
                >
                  Dark elevated ramp
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <GlobalScaleSection
          config={activeScaleConfig}
          patchGlobal={activeScalePatch}
          global={activeRampVisual}
          selectedIndex={selectedGlobalIndex}
          onSelectSwatch={wb.selectGlobal}
        />
        <div className="mt-6">
          {/*
            Passing `setScaleConfigPreset` keeps commits on the active edit target (Simple: global ramp;
            Advanced: light vs dark sibling) so `memo(VariantsSection)` stays stable when only the target swaps.
          */}
          <VariantsSection
            config={wb.okhslEditableConfig}
            onChange={wb.setScaleConfigPreset}
          />
        </div>
        <div
          id="nsb-workbench-controls-okhsl"
          className="mt-6 border-t border-hairline pt-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-default">
                OKHSL authoring overlay
              </p>
              <p className="text-xs text-muted">
                Edit via gamut-relative coordinates. Commits back to OKLCH
                config.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {wb.okhslEnabled ? (
                <button
                  type="button"
                  onClick={() =>
                    wb.setScaleConfigPreset(
                      (cfg) => ({
                        ...cfg,
                        hue: DEFAULT_GLOBAL.hue,
                        lHigh: DEFAULT_GLOBAL.lHigh,
                        lLow: DEFAULT_GLOBAL.lLow,
                        baseChroma: DEFAULT_GLOBAL.baseChroma,
                      }),
                      'OKHSL · Reset',
                    )
                  }
                  className="rounded-full border border-hairline bg-(--ns-chip) px-3 py-1.5 text-xs font-medium text-subtle transition hover:bg-sidebar-border"
                >
                  Reset
                </button>
              ) : null}
              <button
                id="nsb-workbench-controls-okhsl-toggle"
                type="button"
                onClick={() => wb.setOkhslEnabled((v) => !v)}
                className="rounded-full border border-hairline bg-(--ns-chip) px-3 py-1.5 text-xs font-medium text-subtle transition hover:bg-sidebar-border"
                aria-expanded={wb.okhslEnabled}
              >
                {wb.okhslEnabled ? 'Hide OKHSL' : 'Show OKHSL'}
              </button>
            </div>
          </div>
          {wb.okhslEnabled ? (
            <div className="mt-4">
              <OkhslSection
                view={wb.okhslView}
                resolvedConfig={{
                  hue: wb.okhslEditableConfig.hue,
                  baseChroma: wb.okhslEditableConfig.baseChroma,
                  lHigh: wb.okhslEditableConfig.lHigh,
                  lLow: wb.okhslEditableConfig.lLow,
                }}
                onEdit={(edit, label) =>
                  wb.setGlobalConfigFromOkhsl(edit, label)
                }
              />
            </div>
          ) : null}
        </div>
      </CollapsibleControlGroup>

      <BrandColorSection
        systemConfig={wb.systemConfig}
        patchSystem={wb.patchSystem}
      />

      <CollapsibleControlGroup
        id="mapping"
        title="Contrast & role mapping"
        subtitle="Contrast distance, step intervals, starts, and token counts per role ladder."
        defaultOpen
      >
        <SystemMappingSection
          config={wb.systemConfig}
          derivationLight={wb.effectiveMappingLight}
          derivationDark={wb.effectiveMappingDark}
          contrastEmphasis={wb.contrastEmphasis}
          patchSystem={wb.patchSystem}
          stepsLight={wb.ladderLightSteps}
          stepsDark={wb.ladderDarkSteps}
          alphaBaseIndices={wb.alphaBaseIndices}
        />
        <div className="mt-6 border-t border-hairline pt-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-default">Alpha neutral base offset</p>
            <p className="text-xs text-muted">
              Nudge the alpha token anchor from <code className="font-mono">text.default</code> resolved index.
              Light base: {wb.alphaBaseIndices.lightBase} · Dark base: {wb.alphaBaseIndices.darkBase}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Light offset</span>
              <input
                type="number"
                min={-10}
                max={10}
                value={wb.alphaConfig.lightIndexOffset}
                onChange={(e) =>
                  wb.setAlphaConfig((prev) => ({...prev, lightIndexOffset: Number(e.target.value)}))
                }
                className="w-full rounded border border-hairline bg-(--ns-field) px-2 py-1 text-right text-xs font-mono"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Dark offset</span>
              <input
                type="number"
                min={-10}
                max={10}
                value={wb.alphaConfig.darkIndexOffset}
                onChange={(e) =>
                  wb.setAlphaConfig((prev) => ({...prev, darkIndexOffset: Number(e.target.value)}))
                }
                className="w-full rounded border border-hairline bg-(--ns-field) px-2 py-1 text-right text-xs font-mono"
              />
            </label>
          </div>
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="inspect"
        title="Inspect & paired views"
        subtitle="Theme panels, ramp usage, and role tables."
        defaultOpen={false}
      >
        <ThemePanelsSection
          global={wb.global}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          onSelectSystem={wb.selectSystem}
        />
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="export"
        title="Export"
        subtitle="JSON, CSS, CSV, Tailwind @theme."
        defaultOpen={false}
      >
        <ExportSection
          architecture={wb.neutralArchitecture}
          architectureRamps={wb.architectureRamps}
          globalScale={wb.globalScale}
          lightScale={wb.lightScale}
          darkScale={wb.darkScale}
          systemConfig={wb.systemConfig}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          alphaConfig={wb.alphaConfig}
        />
      </CollapsibleControlGroup>
    </div>
  )
}

export const BuilderControlsSections = memo(BuilderControlsSectionsInner)
