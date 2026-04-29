'use client'

import {useCallback, useEffect} from 'react'

import {LiveThemeStyles} from '@/components/providers/LiveThemeStyles'
import {Inspector} from '@/components/workbench/Inspector'
import {WorkbenchControlsShell} from '@/components/workbench/WorkbenchControlsShell'
import {WorkbenchHeader} from '@/components/workbench/WorkbenchHeader'
import {WorkbenchLoadingToast} from '@/components/workbench/WorkbenchLoadingToast'
import {WorkbenchPreviewColumn} from '@/components/workbench/WorkbenchPreviewColumn'
import {useNeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {migrateSystemMappingConfig} from '@/lib/neutral-engine'
import {DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import type {
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
  SystemToken,
} from '@/lib/neutral-engine/types'

/** Stable empty refs so Inspector can skip updates when system tokens are not needed. */
const EMPTY_SYSTEM_TOKENS: SystemToken[] = []

export function Workbench() {
  const wb = useNeutralWorkbench()
  const {
    setSystemConfig,
    setSelection,
    setGlobalScale,
    setLightScale,
    setDarkScale,
    setNeutralArchitecture,
  } = wb

  useEffect(() => {
    function onLoad(e: Event) {
      const ce = e as CustomEvent<{
        globalConfig?: GlobalScaleConfig
        architecture?: NeutralArchitectureMode
        globalScale?: GlobalScaleConfig
        lightScale?: GlobalScaleConfig
        darkScale?: GlobalScaleConfig
        systemConfig?: SystemMappingConfig
      }>
      const d = ce.detail
      if (!d) return
      if (d.systemConfig) {
        setSystemConfig(migrateSystemMappingConfig(d.systemConfig), 'System mapping')
      }

      const legacyOnlyGlobal =
        Boolean(d.globalConfig) &&
        d.globalScale === undefined &&
        d.lightScale === undefined &&
        d.darkScale === undefined

      if (legacyOnlyGlobal) {
        const arch = d.architecture ?? 'simple'
        setNeutralArchitecture(arch as NeutralArchitectureMode, 'Preset · load')
        setGlobalScale(
          {
            ...DEFAULT_GLOBAL_SCALE_CONFIG,
            ...d.globalConfig,
            steps: clampGlobalScaleSteps(d.globalConfig!.steps ?? 16),
          },
          'Global scale',
        )
        return
      }

      if (d.architecture != null) {
        setNeutralArchitecture(d.architecture, 'Preset · architecture')
      }
      if (d.globalScale) {
        setGlobalScale(
          {
            ...DEFAULT_GLOBAL_SCALE_CONFIG,
            ...d.globalScale,
            steps: clampGlobalScaleSteps(d.globalScale.steps),
          },
          'Global scale',
        )
      }
      if (d.lightScale) {
        setLightScale(
          (prev) => ({
            ...prev,
            ...d.lightScale,
            steps: clampGlobalScaleSteps(d.lightScale!.steps),
          }),
          'Light scale',
        )
      }
      if (d.darkScale) {
        setDarkScale(
          (prev) => ({
            ...prev,
            ...d.darkScale,
            steps: clampGlobalScaleSteps(d.darkScale!.steps),
          }),
          'Dark scale',
        )
      }
    }
    window.addEventListener('neutral-system:load-preset', onLoad)
    return () => window.removeEventListener('neutral-system:load-preset', onLoad)
  }, [
    setSystemConfig,
    setNeutralArchitecture,
    setGlobalScale,
    setLightScale,
    setDarkScale,
  ])

  const selectedGlobalIndex =
    wb.selection?.kind === 'global' ? wb.selection.index : null

  const dismissGlobalInspector = useCallback(() => {
    setSelection(null)
  }, [setSelection])

  return (
    <div
      id="nsb-workbench"
      className="ns-workbench bg-(--ns-app-bg) text-(--ns-text)"
    >
      <LiveThemeStyles
        architecture={wb.neutralArchitecture}
        ramps={wb.architectureRamps}
        lightTokens={wb.lightTokens}
        darkTokens={wb.darkTokens}
        alphaConfig={wb.alphaConfig}
      />
      <WorkbenchLoadingToast busy={wb.inputBusy} label={wb.busyInputLabel} />

      <WorkbenchHeader
        previewTheme={wb.previewTheme}
        onPreviewTheme={wb.setPreviewTheme}
        contrastEmphasis={wb.contrastEmphasis}
        onContrastEmphasis={wb.setContrastEmphasis}
        showContrastPairs={wb.showContrastPairs}
        onShowContrastPairs={wb.setShowContrastPairs}
        comparisonLayout={wb.comparisonLayout}
        onComparisonLayoutChange={wb.setComparisonLayout}
        inspectionMode={wb.inspectionMode}
        onToggleInspection={wb.toggleInspectionMode}
      />

      <main
        id="nsb-preview-column"
        className="ns-workbench__preview-col min-h-0 min-w-0 bg-sunken!"
      >
        <WorkbenchPreviewColumn
          previewTheme={wb.previewTheme}
          showContrastPairs={wb.showContrastPairs}
          neutralArchitecture={wb.neutralArchitecture}
          globalLight={wb.lightRamp}
          globalDark={wb.darkRamp}
          unifiedGlobal={wb.neutralArchitecture === 'simple' ? wb.lightRamp : undefined}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          liveBrandSurfaceOklch={wb.liveBrandSurfaceOklch}
          comparisonLayout={wb.comparisonLayout}
          inspectionMode={wb.inspectionMode}
          onSelectSystem={wb.selectSystem}
          derivationConfigLight={wb.effectiveMappingLight}
          derivationConfigDark={wb.effectiveMappingDark}
          ladderLightSteps={wb.ladderLightSteps}
          ladderDarkSteps={wb.ladderDarkSteps}
          alphaBaseIndices={wb.alphaBaseIndices}
        />
      </main>

      <aside
        id="nsb-inspector"
        className="ns-workbench__inspector-col h-full min-w-0 border-t border-hairline bg-sunken nsb-lg:border-t-0 nsb-lg:border-l"
      >
        <div className="ns-workbench__inspector-scroll bg-sunken p-4">
          <Inspector
            selection={wb.selection}
            global={wb.inspectionGlobalRamp}
            lightTokens={
              wb.selection?.kind === 'system'
                ? wb.lightTokens
                : EMPTY_SYSTEM_TOKENS
            }
            darkTokens={
              wb.selection?.kind === 'system'
                ? wb.darkTokens
                : EMPTY_SYSTEM_TOKENS
            }
            onDismissGlobal={dismissGlobalInspector}
          />
          <WorkbenchControlsShell
            wb={wb}
            selectedGlobalIndex={selectedGlobalIndex}
          />
        </div>
      </aside>
    </div>
  )
}
