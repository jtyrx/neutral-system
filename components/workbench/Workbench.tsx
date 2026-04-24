'use client'

import {useCallback, useEffect} from 'react'

import {LiveThemeStyles} from '@/components/providers/LiveThemeStyles'
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
  const setSelection = wb.setSelection

  useEffect(() => {
    function onLoad(e: Event) {
      const ce = e as CustomEvent<{globalConfig: GlobalScaleConfig; systemConfig: SystemMappingConfig}>
      if (ce.detail?.globalConfig) {
        const g = ce.detail.globalConfig
        setGlobalConfig({...g, steps: clampGlobalScaleSteps(g.steps)}, 'Global scale')
      }
      if (ce.detail?.systemConfig) {
        setSystemConfig(migrateSystemMappingConfig(ce.detail.systemConfig), 'System mapping')
      }
    }
    window.addEventListener('neutral-system:load-preset', onLoad)
    return () => window.removeEventListener('neutral-system:load-preset', onLoad)
  }, [setGlobalConfig, setSystemConfig])

  const selectedGlobalIndex =
    wb.selection?.kind === 'global' ? wb.selection.index : null

  const dismissGlobalInspector = useCallback(() => {
    setSelection(null)
  }, [setSelection])

  return (
    <div id="nsb-workbench" className="ns-workbench bg-(--ns-app-bg) text-(--ns-text)">
      <LiveThemeStyles
        global={wb.global}
        lightTokens={wb.lightTokens}
        darkTokens={wb.darkTokens}
        themeMode={wb.themeMode}
      />
      <WorkbenchLoadingToast busy={wb.inputBusy} label={wb.busyInputLabel} />

      <div id="nsb-mob-toolbar" className="ns-workbench__mob-toolbar ns-panel border-b border-hairline">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="eyebrow">Neutral System</p>
            <p className="text-sm font-semibold tracking-tight text-default">Builder</p>
          </div>
          <ThemePreviewControls
            globalThemeMode={wb.themeMode}
            onGlobalThemeMode={wb.setThemeMode}
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

      {/* <aside className="ns-workbench__controls-col order-2 min-h-0 border-hairline lg:order-0 lg:border-r lg:bg-raised">
         <WorkbenchControlsShell wb={wb} selectedGlobalIndex={selectedGlobalIndex} /> 
      </aside> */}

      <main id="nsb-preview-column" className="ns-workbench__preview-col min-h-0 min-w-0">
        <WorkbenchPreviewColumn
          previewTheme={wb.previewTheme}
          showContrastPairs={wb.showContrastPairs}
          global={wb.global}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          liveBrandSurfaceOklch={wb.liveBrandSurfaceOklch}
          comparisonLayout={wb.comparisonLayout}
          onComparisonLayoutChange={wb.setComparisonLayout}
          contrastEmphasis={wb.contrastEmphasis}
          inspectionMode={wb.inspectionMode}
          onToggleInspection={wb.toggleInspectionMode}
          onSelectSystem={wb.selectSystem}
          derivationConfig={wb.effectiveMappingConfig}
          steps={clampGlobalScaleSteps(wb.globalConfig.steps)}
        />
      </main>

      <aside
        id="nsb-inspector"
        className="ns-workbench__inspector-col h-full min-w-0 border-t border-hairline nsb-lg:border-l nsb-lg:border-t-0"
      >
        <div className="sticky top-0 max-h-dvh overflow-y-auto p-4">
          <div className="mb-4 hidden items-center justify-between gap-2 nsb-lg:flex">
            <p className="eyebrow">Preview</p>
            <ThemePreviewControls
              globalThemeMode={wb.themeMode}
              onGlobalThemeMode={wb.setThemeMode}
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
            onDismissGlobal={dismissGlobalInspector}
          />
          <WorkbenchControlsShell wb={wb} selectedGlobalIndex={selectedGlobalIndex} />
        </div>
      </aside>
    </div>
  )
}
