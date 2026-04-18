'use client'

import {useEffect} from 'react'

import {Inspector} from '@/components/workbench/Inspector'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import {WorkbenchControlsShell} from '@/components/workbench/WorkbenchControlsShell'
import {WorkbenchLoadingToast} from '@/components/workbench/WorkbenchLoadingToast'
import {WorkbenchPreviewColumn} from '@/components/workbench/WorkbenchPreviewColumn'
import {useNeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {migrateSystemMappingConfig} from '@/lib/neutral-engine'
import type {GlobalScaleConfig, SystemMappingConfig, SystemToken} from '@/lib/neutral-engine/types'

/** Stable empty refs so Inspector can skip updates when system tokens are not needed. */
const EMPTY_SYSTEM_TOKENS: SystemToken[] = []

export function Workbench() {
  const wb = useNeutralWorkbench()
  const setGlobalConfig = wb.setGlobalConfig
  const setSystemConfig = wb.setSystemConfig

  useEffect(() => {
    function onLoad(e: Event) {
      const ce = e as CustomEvent<{globalConfig: GlobalScaleConfig; systemConfig: SystemMappingConfig}>
      if (ce.detail?.globalConfig) {
        const g = ce.detail.globalConfig
        setGlobalConfig({...g, steps: clampGlobalScaleSteps(g.steps)})
      }
      if (ce.detail?.systemConfig) {
        setSystemConfig(migrateSystemMappingConfig(ce.detail.systemConfig))
      }
    }
    window.addEventListener('neutral-system:load-preset', onLoad)
    return () => window.removeEventListener('neutral-system:load-preset', onLoad)
  }, [setGlobalConfig, setSystemConfig])

  const selectedGlobalIndex =
    wb.selection?.kind === 'global' ? wb.selection.index : null

  return (
    <div className="ns-workbench flex min-h-dvh flex-col bg-[oklch(0.12_0.02_285)] lg:grid lg:min-h-dvh grid-cols-[minmax(0,1fr)_minmax(0,36rem)]  xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)] lg:grid-rows-1">
      <WorkbenchLoadingToast busy={wb.inputBusy} />

      <div className="ns-workbench__mob-toolbar ns-panel border-b border-white/10 lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="eyebrow">Neutral System</p>
            <p className="text-sm font-semibold tracking-tight text-white">Builder</p>
          </div>
          <ThemePreviewControls
            previewTheme={wb.previewTheme}
            onPreviewTheme={wb.setPreviewTheme}
            contrastEmphasis={wb.contrastEmphasis}
            onContrastEmphasis={wb.setContrastEmphasis}
            showContrastPairs={wb.showContrastPairs}
            onShowContrastPairs={wb.setShowContrastPairs}
            dense
          />
        </div>
      </div>

      {/* <aside className="ns-workbench__controls-col order-2 min-h-0 border-white/10 lg:order-none lg:border-r lg:bg-black/20">
         <WorkbenchControlsShell wb={wb} selectedGlobalIndex={selectedGlobalIndex} /> 
      </aside> */}

      <main className="ns-workbench__preview-col order-1 min-h-0 min-w-0 lg:order-none">
        <WorkbenchPreviewColumn
          previewTheme={wb.previewTheme}
          onPreviewTheme={wb.setPreviewTheme}
          contrastEmphasis={wb.contrastEmphasis}
          onContrastEmphasis={wb.setContrastEmphasis}
          showContrastPairs={wb.showContrastPairs}
          onShowContrastPairs={wb.setShowContrastPairs}
          global={wb.global}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          comparisonLayout={wb.comparisonLayout}
          onComparisonLayout={wb.setComparisonLayout}
          systemConfig={wb.systemConfig}
          steps={clampGlobalScaleSteps(wb.globalConfig.steps)}
        />
      </main>

      <aside className="ns-workbench__inspector-col order-3 h-full min-w-0 border-t border-white/10 lg:order-none lg:border-l lg:border-t-0">
        <div className="sticky top-0 max-h-dvh overflow-y-auto p-4">
          <div className="mb-4 hidden items-center justify-between gap-2 lg:flex">
            <p className="eyebrow">Preview</p>
            <ThemePreviewControls
              previewTheme={wb.previewTheme}
              onPreviewTheme={wb.setPreviewTheme}
              contrastEmphasis={wb.contrastEmphasis}
              onContrastEmphasis={wb.setContrastEmphasis}
              showContrastPairs={wb.showContrastPairs}
              onShowContrastPairs={wb.setShowContrastPairs}
              dense
            />
          </div>
          <Inspector
            selection={wb.selection}
            global={wb.global}
            lightTokens={wb.selection?.kind === 'system' ? wb.lightTokens : EMPTY_SYSTEM_TOKENS}
            darkTokens={wb.selection?.kind === 'system' ? wb.darkTokens : EMPTY_SYSTEM_TOKENS}
          />
          <WorkbenchControlsShell wb={wb} selectedGlobalIndex={selectedGlobalIndex} />
        </div>
      </aside>
    </div>
  )
}
