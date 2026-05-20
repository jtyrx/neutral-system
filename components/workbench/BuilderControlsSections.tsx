'use client'

import {memo, useMemo} from 'react'
import dynamic from 'next/dynamic'

import {Blend, Braces, Map, Paintbrush, Palette, Route} from 'lucide-react'

import {BrandColorSection} from '@/components/sections/BrandColorSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSection} from '@/components/sections/OkhslSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {OklchPickerPanel} from '@/components/picker/OklchPickerPanel'
import {PillButton, PillChip} from '@/components/ui/chip.tsx'
import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {DEFAULT_GLOBAL, type NeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {useOklchPickerWorkbench} from '@/hooks/useOklchPickerWorkbench'
import {sandboxWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

const ExportSection = dynamic(
  () =>
    import('@/components/sections/ExportSection').then((m) => ({
      default: m.ExportSection,
    })),
  {ssr: false, loading: () => null},
)

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Grouped controls: Scale → Mapping → Inspect → Export. */
function BuilderControlsSectionsInner({wb, selectedGlobalIndex}: Props) {
  const simpleArch = wb.neutralArchitecture === 'simple'
  const sandboxPicker = useOklchPickerWorkbench()
  const sandboxAdapter = useMemo(() => sandboxWorkbenchAdapter(sandboxPicker), [sandboxPicker])

  const activeRampVisual = simpleArch
    ? wb.global
    : wb.scaleEditTarget === 'dark'
      ? wb.darkRamp
      : wb.lightRamp
  return (
    <div className="flex flex-col gap-16 pb-48">
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
        <div className="space-y-16">
          <div>
            <div className="mt-4 space-y-8 text-xs text-muted">
              {simpleArch
                ? 'Steps, lightness range, chroma shaping, and hue variants.'
                : 'Independent light / dark ramps — pick which ladder you edit, then tweak steps and chroma.'}
            </div>
            <p className="text-xs font-medium text-default">Architecture</p>
            <p className="mt-4 text-micro text-muted">
              Simple mirrors one ramp into both themes by mapping. Advanced
              keeps independent ramps for optics.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
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
              <p className="mt-4 text-micro text-muted">
                Hue variants and OKHSL commits apply here. Inspect the other
                ramp visually in previews.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
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
          lightRampConfig={simpleArch ? wb.globalScale : wb.lightScale}
          patchLightRamp={simpleArch ? wb.patchGlobal : wb.patchLight}
          darkRampConfig={simpleArch ? wb.globalScale : wb.darkScale}
          patchDarkRamp={simpleArch ? wb.patchGlobal : wb.patchDark}
          global={activeRampVisual}
          selectedIndex={selectedGlobalIndex}
          onSelectSwatch={wb.selectGlobal}
        />

        {/* OKHSL authoring overlay */}
        <div
          id="nsb-workbench-controls-okhsl"
          className="mt-24  border-hairline pt-24"
        >
          <div className="flex items-center justify-between gap-12">
            <div>
              <p className="text-xs font-medium text-default">
                OKHSL authoring overlay
              </p>
              <p className="text-xs text-muted">
                Edit via gamut-relative coordinates. Commits back to OKLCH
                config.
              </p>
            </div>
            <div className="flex items-center gap-8">
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
            <div className="mt-16">
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
        <div className="mt-24">
          {/*
            Passing `setScaleConfigPreset` keeps commits on the active edit target (Simple: global ramp;
            Advanced: light vs dark sibling) so `memo(VariantsSection)` stays stable when only the target swaps.
          */}
          <VariantsSection
            config={wb.okhslEditableConfig}
            onChange={wb.setScaleConfigPreset}
          />
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="workbench-oklch-picker"
        icon={Palette}
        title="OKLCH picker (parallel)"
        defaultOpen={false}
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
          Gamut-aware L / C / H exploration on a separate engine config. Use{' '}
          <span className="font-medium text-default">Apply to global scale</span> to copy the
          resulting ramp into Simple mode (single ladder).
        </div>
        <div className="mt-16">
          <OklchPickerPanel variant="embedded" adapter={sandboxAdapter} />
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id="workbench-custom-brand"
        icon={Paintbrush}
        title="Custom brand"
        // additionalInfo="Brand input (OKLCH / Hex / RGB / Display-P3) — synced with preview, exports, and the Color.js picker."
        defaultOpen
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
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
        <div className="mt-4 space-y-8 text-xs text-muted">
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
        <div className="mt-24 space-y-12  border-hairline pt-24">
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
          <div className="grid grid-cols-2 gap-12">
            <label className="flex flex-col gap-4">
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
                className="w-full rounded border border-hairline bg-field px-8 py-4 text-right font-mono text-xs"
              />
            </label>
            <label className="flex flex-col gap-4">
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
                className="w-full rounded border border-hairline bg-field px-8 py-4 text-right font-mono text-xs"
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
        <div className="mt-4 space-y-8 text-xs text-muted">Theme panels, ramp usage, and role tables.</div>
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
