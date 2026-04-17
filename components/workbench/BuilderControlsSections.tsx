'use client'

import {ExportSection} from '@/components/sections/ExportSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** All neutral-builder control sections — add new tools here. */
export function BuilderControlsSections({wb, selectedGlobalIndex}: Props) {
  return (
    <div className="space-y-14 pb-16 lg:space-y-16 lg:pb-24">
      <GlobalScaleSection
        config={wb.globalConfig}
        patchGlobal={wb.patchGlobal}
        global={wb.global}
        selectedIndex={selectedGlobalIndex}
        onSelectSwatch={wb.selectGlobal}
      />
      <SystemMappingSection
        config={wb.systemConfig}
        derivationConfig={wb.effectiveMappingConfig}
        contrastMode={wb.contrastMode}
        patchSystem={wb.patchSystem}
        steps={clampGlobalScaleSteps(wb.globalConfig.steps)}
      />
      <ThemePanelsSection
        global={wb.global}
        lightTokenView={wb.lightTokenView}
        darkTokenView={wb.darkTokenView}
        onSelectSystem={wb.selectSystem}
      />
      <VariantsSection config={wb.globalConfig} onChange={wb.setGlobalConfig} />
      <ExportSection
        globalConfig={wb.globalConfig}
        systemConfig={wb.systemConfig}
        global={wb.global}
        lightTokens={wb.lightTokens}
        darkTokens={wb.darkTokens}
      />
    </div>
  )
}
