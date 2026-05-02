'use client'

import {memo} from 'react'

import { Blend, Braces, Map, Paintbrush, Route } from 'lucide-react'

import {BrandColorSection} from '@/components/sections/BrandColorSection'
import {ExportSection} from '@/components/sections/ExportSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSection} from '@/components/sections/OkhslSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {PillButton, PillChip} from '@/components/ui/chip'
import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {DEFAULT_GLOBAL} from '@/hooks/useNeutralWorkbench'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Grouped controls: Scale → Mapping → Inspect → Export. */
function BuilderControlsSectionsInner({wb, selectedGlobalIndex}: Props) {
  const simpleArch = wb.neutralArchitecture === 'simple'

  const activeRampVisual = simpleArch
    ? wb.global
    : wb.scaleEditTarget === 'dark'
      ? wb.darkRamp
      : wb.lightRamp
  return (
    <div className="flex flex-col gap-4 pb-12">
      <CollapsibleControlGroup
        id="neutral-workbench-controls-scale"
        icon={Blend}
        title={
          simpleArch ? 'Global neutral scale ladder' : 'Neutral scale ladders'
        }
        // additionalInfo={
        //   <>
        //     <p>
        //       {simpleArch
        //         ? 'Steps, lightness range, chroma shaping, and hue variants.'
        //         : 'Independent light / dark ramps — pick which ladder you edit, then tweak steps and chroma.'}
        //     </p>
        //     <AdditionalInfoPreviewCard additionalInfo="How this ladder works">
        //       <p className="max-w-2xl text-sm text-muted">
        //         Linear OKLCH lightness from light to dark (8–48 steps; default 41). Hue and chroma stay locked or shaped by the chroma mode. Tier-1 primitives feed semantic tokens.
        //       </p>
        //     </AdditionalInfoPreviewCard>
        //   </>
        // }
        defaultOpen
      >
        <div className="space-y-4">
          <div>
            <div className="mt-1 space-y-2 text-xs text-muted">
              {simpleArch
                ? 'Steps, lightness range, chroma shaping, and hue variants.'
                : 'Independent light / dark ramps — pick which ladder you edit, then tweak steps and chroma.'}
            </div>
            <p className="text-xs font-medium text-default">Architecture</p>
            <p className="mt-1 text-[0.65rem] text-muted">
              Simple mirrors one ramp into both themes by mapping. Advanced
              keeps independent ramps for optics.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <PillChip
                selected={simpleArch}
                tone="amber"
                activeStyle="pill"
                onClick={() => wb.setNeutralArchitecture('simple')}
              >
                Simple · single ladder
              </PillChip>
              <PillChip
                selected={!simpleArch}
                tone="sky"
                activeStyle="pill"
                onClick={() => wb.setNeutralArchitecture('advanced')}
              >
                Advanced · sibling ramps
              </PillChip>
            </div>
          </div>

          {!simpleArch ? (
            <div>
              <p className="text-xs font-medium text-default">
                Edit target ramp
              </p>
              <p className="mt-1 text-[0.65rem] text-muted">
                Hue variants and OKHSL commits apply here. Inspect the other
                ramp visually in previews.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <PillChip
                  selected={wb.scaleEditTarget === 'light'}
                  tone="amber"
                  activeStyle="surface-soft"
                  onClick={() => wb.setScaleEditTarget('light')}
                >
                  Light ramp
                </PillChip>
                <PillChip
                  selected={wb.scaleEditTarget === 'dark'}
                  tone="sky"
                  activeStyle="surface-soft"
                  onClick={() => wb.setScaleEditTarget('dark')}
                >
                  Dark elevated ramp
                </PillChip>
              </div>
            </div>
          ) : null}
        </div>

        <GlobalScaleSection
          architecture={wb.neutralArchitecture}
          comparisonConfig={wb.globalScale}
          curveModeNamingConfig={simpleArch ? wb.globalScale : wb.lightScale}
          lightRampConfig={simpleArch ? wb.globalScale : wb.lightScale}
          patchLightRamp={simpleArch ? wb.patchGlobal : wb.patchLight}
          darkRampConfig={simpleArch ? wb.globalScale : wb.darkScale}
          patchDarkRamp={simpleArch ? wb.patchGlobal : wb.patchDark}
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
          className="mt-6  border-hairline pt-6"
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
                <PillButton
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
                >
                  Reset
                </PillButton>
              ) : null}
              <PillButton
                id="nsb-workbench-controls-okhsl-toggle"
                type="button"
                onClick={() => wb.setOkhslEnabled((v) => !v)}
                aria-expanded={wb.okhslEnabled}
              >
                {wb.okhslEnabled ? 'Hide OKHSL' : 'Show OKHSL'}
              </PillButton>
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

      <CollapsibleControlGroup
        id="workbench-custom-brand"
        icon={Paintbrush}
        title="Custom brand"
        // additionalInfo="Brand input (OKLCH / Hex / RGB / Display-P3) — synced with preview, exports, and the Color.js picker."
        defaultOpen
      >
        <div className="mt-1 space-y-2 text-xs text-muted">
          Brand input (OKLCH / Hex / RGB / Display-P3) — synced with preview,
          exports, and the Color.js picker.
        </div>
        <BrandColorSection
          systemConfig={wb.systemConfig}
          patchSystem={wb.patchSystem}
        />
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="workbench-mapping"
        icon={Map}
        title="Contrast & role mapping"
        // additionalInfo="Contrast distance, step intervals, starts, and token counts per role ladder."
        defaultOpen
      >
        <div className="mt-1 space-y-2 text-xs text-muted">
          Contrast distance, step intervals, starts, and token counts per role
          ladder.
        </div>
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
        <div className="mt-6 space-y-3  border-hairline pt-6">
          <div>
            <p className="text-xs font-medium text-default">
              Alpha neutral base offset
            </p>
            <p className="text-xs text-muted">
              Nudge the alpha token anchor from{' '}
              <code className="font-mono">text.default</code> resolved index.
              Light base: {wb.alphaBaseIndices.lightBase} · Dark base:{' '}
              {wb.alphaBaseIndices.darkBase}
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
                  wb.setAlphaConfig((prev) => ({
                    ...prev,
                    lightIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-(--ns-field) px-2 py-1 text-right font-mono text-xs"
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
                  wb.setAlphaConfig((prev) => ({
                    ...prev,
                    darkIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-(--ns-field) px-2 py-1 text-right font-mono text-xs"
              />
            </label>
          </div>
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="workbench-inspect"
        icon={Route}
        title="Inspect & paired views"
        // additionalInfo="Theme panels, ramp usage, and role tables."
        defaultOpen={false}
      >
        <div className="mt-1 space-y-2 text-xs text-muted">Theme panels, ramp usage, and role tables.</div>
        <ThemePanelsSection
          globalLight={wb.lightRamp}
          globalDark={wb.darkRamp}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          onSelectSystem={wb.selectSystem}
        />
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="export"
        icon={Braces}
        title="Export"
        // subtitle="JSON, CSS, CSV, Tailwind @theme."
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
