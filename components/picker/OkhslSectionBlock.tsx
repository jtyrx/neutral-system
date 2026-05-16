'use client'

import {memo} from 'react'

import {OkhslSection} from '@/components/sections/OkhslSection'
import {Button} from '@/components/ui/button.tsx'
import {DEFAULT_GLOBAL} from '@/hooks/useNeutralWorkbench'
import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
import {cn} from '@/lib/utils'

type OkhslSectionBlockProps = {
  adapter: WorkbenchAdapter
  id?: string
  className?: string
}

function OkhslSectionBlockInner({adapter, id, className}: OkhslSectionBlockProps) {
  return (
    <div id={id} className={cn('picker-section-divider', className)}>
      <div className="picker-section-header-row">
        <div>
          <p className="text-xs font-medium text-default">OKHSL authoring overlay</p>
          <p className="text-xs text-muted">
            Edit via gamut-relative coordinates. Commits back to OKLCH config.
          </p>
        </div>
        <div className="picker-control-row">
          {adapter.okhslEnabled ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                adapter.setScaleConfigPreset(
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
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adapter.setOkhslEnabled((v) => !v)}
            aria-expanded={adapter.okhslEnabled}
          >
            {adapter.okhslEnabled ? 'Hide OKHSL' : 'Show OKHSL'}
          </Button>
        </div>
      </div>
      {adapter.okhslEnabled ? (
        <div className="mt-4">
          <OkhslSection
            view={adapter.okhslView}
            resolvedConfig={{
              hue: adapter.okhslEditableConfig.hue,
              baseChroma: adapter.okhslEditableConfig.baseChroma,
              lHigh: adapter.okhslEditableConfig.lHigh,
              lLow: adapter.okhslEditableConfig.lLow,
            }}
            onEdit={(edit, label) => adapter.setGlobalConfigFromOkhsl(edit, label)}
          />
        </div>
      ) : null}
    </div>
  )
}

export const OkhslSectionBlock = memo(OkhslSectionBlockInner)
