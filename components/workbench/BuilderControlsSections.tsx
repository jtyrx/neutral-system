'use client'

import {memo} from 'react'

import {BrandColorSection} from '@/components/sections/BrandColorSection'
import {ExportSection} from '@/components/sections/ExportSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSection} from '@/components/sections/OkhslSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {DEFAULT_GLOBAL} from '@/hooks/useNeutralWorkbench'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Grouped controls: Scale → Mapping → Inspect → Export. */
function BuilderControlsSectionsInner({wb, selectedGlobalIndex}: Props) {
  const steps = clampGlobalScaleSteps(wb.globalConfig.steps)
  return (
    <div className="flex flex-col gap-4 pb-12">
      <CollapsibleControlGroup
        id="scale"
        title="Scale"
        subtitle="Steps, lightness range, chroma shaping, and hue variants."
        defaultOpen
      >
        <GlobalScaleSection
          config={wb.globalConfig}
          patchGlobal={wb.patchGlobal}
          global={wb.global}
          selectedIndex={selectedGlobalIndex}
          onSelectSwatch={wb.selectGlobal}
        />
        <div className="mt-6">
          {/*
            Presets are scheduled as a Transition (`setGlobalConfig`), so the click commits
            the button's selected state instantly while React reconciles heavy downstream
            derivation off the urgent-update path. Passing the setter directly keeps the
            `onChange` prop referentially stable so `memo(VariantsSection)` can short-circuit.
          */}
          <VariantsSection
            config={wb.globalConfig}
            onChange={wb.setGlobalConfig}
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
                    wb.setGlobalConfig(
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
                  hue: wb.globalConfig.hue,
                  baseChroma: wb.globalConfig.baseChroma,
                  lHigh: wb.globalConfig.lHigh,
                  lLow: wb.globalConfig.lLow,
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
          derivationConfig={wb.effectiveMappingConfig}
          contrastEmphasis={wb.contrastEmphasis}
          patchSystem={wb.patchSystem}
          steps={steps}
        />
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
          globalConfig={wb.globalConfig}
          systemConfig={wb.systemConfig}
          global={wb.global}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
        />
      </CollapsibleControlGroup>
    </div>
  )
}

export const BuilderControlsSections = memo(BuilderControlsSectionsInner)
