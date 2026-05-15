'use client'

import {useCallback} from 'react'

import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {Inspector} from '@/components/workbench/Inspector'
import {WorkbenchControlsShell} from '@/components/workbench/WorkbenchControlsShell'
import {WorkbenchHeader} from '@/components/workbench/WorkbenchHeader'
import {WorkbenchLoadingToast} from '@/components/workbench/WorkbenchLoadingToast'
import {WorkbenchPreviewColumn} from '@/components/workbench/WorkbenchPreviewColumn'
import type {SystemToken} from '@/lib/neutral-engine/types'

/** Stable empty refs so Inspector can skip updates when system tokens are not needed. */
const EMPTY_SYSTEM_TOKENS: SystemToken[] = []

export function Workbench() {
  const wb = useNeutralWorkbenchContext()
  const {setSelection} = wb

  const selectedGlobalIndex =
    wb.selection?.kind === 'global' ? wb.selection.index : null

  const dismissGlobalInspector = useCallback(() => {
    setSelection(null)
  }, [setSelection])

  return (
    <div
      id="nsb-workbench"
      className="ns-workbench bg-sunken text-default"
    >
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
