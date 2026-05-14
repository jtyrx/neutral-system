'use client'

import {memo} from 'react'

import {INPUT_WORKBENCH_FIELD_CLASS} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import {ExportSection} from '@/components/sections/ExportSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {OkhslSectionBlock} from '@/components/picker/OkhslSectionBlock'
import {PillChip} from '@/components/ui/chip'
import {useOklchPickerSectionProps} from '@/hooks/useOklchPickerSectionProps'
import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

const alphaInputClass = cn(INPUT_WORKBENCH_FIELD_CLASS, 'h-8 rounded px-2 py-1 text-right font-mono text-xs')

/** Full picker page lower half — architecture → export (same order as standalone `/picker`). */
function OklchPickerStandaloneSettingsInner({adapter}: {adapter: WorkbenchAdapter}) {
  const {simpleArch, globalScaleSectionProps, systemMappingSectionProps, exportSectionProps} =
    useOklchPickerSectionProps(adapter)

  return (
    <div className="space-y-6 picker-section-divider">
      <div>
        <p className="text-xs font-medium text-default">Architecture</p>
        <p className="mt-1 picker-caption">
          Simple mirrors one ramp into both themes. Advanced keeps independent light / dark ramps.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <PillChip
            selected={simpleArch}
            tone="amber"
            activeStyle="pill"
            onClick={() => adapter.setNeutralArchitecture('simple')}
          >
            Simple · single ladder
          </PillChip>
          <PillChip
            selected={!simpleArch}
            tone="sky"
            activeStyle="pill"
            onClick={() => adapter.setNeutralArchitecture('advanced')}
          >
            Advanced · sibling ramps
          </PillChip>
        </div>
      </div>

      {!simpleArch ? (
        <div>
          <p className="text-xs font-medium text-default">Edit target ramp</p>
          <p className="mt-1 picker-caption">
            Hue variants and OKHSL commits apply here. Picker L/C/H syncs to this ladder.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <PillChip
              selected={adapter.scaleEditTarget === 'light'}
              tone="amber"
              activeStyle="surface-soft"
              onClick={() => adapter.setScaleEditTarget('light')}
            >
              Light ramp
            </PillChip>
            <PillChip
              selected={adapter.scaleEditTarget === 'dark'}
              tone="sky"
              activeStyle="surface-soft"
              onClick={() => adapter.setScaleEditTarget('dark')}
            >
              Dark elevated ramp
            </PillChip>
          </div>
        </div>
      ) : null}

      <GlobalScaleSection {...globalScaleSectionProps} />

      <OkhslSectionBlock
        adapter={adapter}
        id="nsb-picker-controls-okhsl"
        className="mt-6"
      />

      <VariantsSection config={adapter.okhslEditableConfig} onChange={adapter.setScaleConfigPreset} />

      <SystemMappingSection {...systemMappingSectionProps} />

      <div className="space-y-3 border-hairline pt-6">
        <div>
          <p className="text-xs font-medium text-default">Alpha neutral base offset</p>
          <p className="text-xs text-muted">
            Nudge the alpha token anchor from <code className="font-mono">text.default</code>{' '}
            resolved index. Light base: {adapter.alphaBaseIndices.lightBase} · Dark base:{' '}
            {adapter.alphaBaseIndices.darkBase}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Light offset</span>
            <input
              type="number"
              min={-10}
              max={10}
              value={adapter.alphaConfig.lightIndexOffset}
              onChange={(e) =>
                adapter.setAlphaConfig((prev) => ({
                  ...prev,
                  lightIndexOffset: Number(e.target.value),
                }))
              }
              className={alphaInputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Dark offset</span>
            <input
              type="number"
              min={-10}
              max={10}
              value={adapter.alphaConfig.darkIndexOffset}
              onChange={(e) =>
                adapter.setAlphaConfig((prev) => ({
                  ...prev,
                  darkIndexOffset: Number(e.target.value),
                }))
              }
              className={alphaInputClass}
            />
          </label>
        </div>
      </div>

      <ExportSection {...exportSectionProps} />
    </div>
  )
}

export const OklchPickerStandaloneSettings = memo(OklchPickerStandaloneSettingsInner)
