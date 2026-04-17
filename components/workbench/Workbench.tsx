'use client'

import {useEffect} from 'react'

import {Inspector} from '@/components/workbench/Inspector'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import {WorkbenchControlsShell} from '@/components/workbench/WorkbenchControlsShell'
import {WorkbenchLoadingToast} from '@/components/workbench/WorkbenchLoadingToast'
import {WorkbenchPreviewColumn} from '@/components/workbench/WorkbenchPreviewColumn'
import {useNeutralWorkbench} from '@/hooks/useNeutralWorkbench'
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
      if (ce.detail?.globalConfig) setGlobalConfig(ce.detail.globalConfig)
      if (ce.detail?.systemConfig) setSystemConfig(ce.detail.systemConfig)
    }
    window.addEventListener('neutral-system:load-preset', onLoad)
    return () => window.removeEventListener('neutral-system:load-preset', onLoad)
  }, [setGlobalConfig, setSystemConfig])

  const selectedGlobalIndex =
    wb.selection?.kind === 'global' ? wb.selection.index : null

  const activePreviewTokens = wb.previewTheme === 'light' ? wb.lightTokens : wb.darkTokens

  return (
    <div className="ns-workbench">
      <WorkbenchLoadingToast busy={wb.inputBusy} />

      <div className="ns-workbench__mob-toolbar ns-panel border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="eyebrow">Neutral System</p>
            <p className="text-sm font-semibold tracking-tight text-white">Builder</p>
          </div>
          <ThemePreviewControls
            previewTheme={wb.previewTheme}
            onPreviewTheme={wb.setPreviewTheme}
            contrastMode={wb.contrastMode}
            onContrastMode={wb.setContrastMode}
            dense
          />
        </div>
      </div>

      <div className="ns-workbench__main min-w-0">
        <WorkbenchPreviewColumn
          previewTheme={wb.previewTheme}
          onPreviewTheme={wb.setPreviewTheme}
          contrastMode={wb.contrastMode}
          onContrastMode={wb.setContrastMode}
          global={wb.global}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          tokens={activePreviewTokens}
        />
        <WorkbenchControlsShell wb={wb} selectedGlobalIndex={selectedGlobalIndex} />
      </div>

      <aside className="ns-workbench__inspector ns-panel flex min-h-0 min-w-0 flex-col overflow-y-auto border-t border-white/10 p-4 lg:sticky lg:top-0 lg:max-h-dvh lg:shrink-0 lg:border-t-0 lg:border-l">
        <Inspector
          selection={wb.selection}
          global={wb.global}
          lightTokens={wb.selection?.kind === 'system' ? wb.lightTokens : EMPTY_SYSTEM_TOKENS}
          darkTokens={wb.selection?.kind === 'system' ? wb.darkTokens : EMPTY_SYSTEM_TOKENS}
        />
      </aside>
    </div>
  )
}
