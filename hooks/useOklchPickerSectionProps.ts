'use client'

import {useMemo} from 'react'

import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

/** Section prop bundles reused by `/picker`, embedded inspector panel, dock tabs. */
export function useOklchPickerSectionProps(adapter: WorkbenchAdapter) {
  const selectedGlobalIndex =
    adapter.selection?.kind === 'global' ? adapter.selection.index : null
  const simpleArch = adapter.neutralArchitecture === 'simple'
  const activeRampVisual = simpleArch
    ? adapter.global
    : adapter.scaleEditTarget === 'dark'
      ? adapter.darkRamp
      : adapter.lightRamp

  const globalScaleSectionProps = useMemo(
    () => ({
      architecture: adapter.neutralArchitecture,
      comparisonConfig: adapter.globalScale,
      curveModeNamingConfig: simpleArch ? adapter.globalScale : adapter.scaleEditTarget === 'dark' ? adapter.darkScale : adapter.lightScale,
      lightRampConfig: simpleArch ? adapter.globalScale : adapter.lightScale,
      patchLightRamp: simpleArch ? adapter.patchGlobal : adapter.patchLight,
      darkRampConfig: simpleArch ? adapter.globalScale : adapter.darkScale,
      patchDarkRamp: simpleArch ? adapter.patchGlobal : adapter.patchDark,
      global: activeRampVisual,
      selectedIndex: selectedGlobalIndex,
      onSelectSwatch: adapter.selectGlobal,
    }),
    [
      adapter,
      activeRampVisual,
      selectedGlobalIndex,
      simpleArch,
    ],
  )

  const systemMappingSectionProps = useMemo(
    () => ({
      config: adapter.systemConfig,
      derivationLight: adapter.effectiveMappingLight,
      derivationDark: adapter.effectiveMappingDark,
      contrastEmphasis: adapter.contrastEmphasis,
      patchSystem: adapter.patchSystem,
      stepsLight: adapter.ladderLightSteps,
      stepsDark: adapter.ladderDarkSteps,
      alphaBaseIndices: adapter.alphaBaseIndices,
    }),
    [adapter],
  )

  const exportSectionProps = useMemo(
    () => ({
      architecture: adapter.neutralArchitecture,
      architectureRamps: adapter.architectureRamps,
      globalScale: adapter.globalScale,
      lightScale: adapter.lightScale,
      darkScale: adapter.darkScale,
      systemConfig: adapter.systemConfig,
      lightTokens: adapter.lightTokens,
      darkTokens: adapter.darkTokens,
      alphaConfig: adapter.alphaConfig,
    }),
    [adapter],
  )

  return {
    simpleArch,
    globalScaleSectionProps,
    systemMappingSectionProps,
    exportSectionProps,
  }
}
