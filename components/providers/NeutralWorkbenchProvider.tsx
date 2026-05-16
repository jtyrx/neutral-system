'use client'

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import {useTheme} from 'next-themes'

import {LiveThemeStyles} from '@/components/providers/LiveThemeStyles'
import {
  useNeutralWorkbench,
  type NeutralWorkbench,
} from '@/hooks/useNeutralWorkbench'
import {migrateSystemMappingConfig} from '@/lib/neutral-engine/defaultSystemMapping'
import {DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import type {
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
} from '@/lib/neutral-engine/types'

const NeutralWorkbenchContext = createContext<NeutralWorkbench | null>(null)
NeutralWorkbenchContext.displayName = 'NeutralWorkbenchContext'

function WorkbenchThemeBridge({wb}: {wb: NeutralWorkbench}) {
  const {resolvedTheme} = useTheme()
  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return
    const next = resolvedTheme === 'dark' ? 'dark' : 'light'
    if (wb.previewTheme !== next) {
      wb.setPreviewTheme(next, 'Theme · system')
    }
  }, [resolvedTheme, wb])
  return null
}

type PresetDetail = {
  globalConfig?: GlobalScaleConfig
  architecture?: NeutralArchitectureMode
  globalScale?: GlobalScaleConfig
  lightScale?: GlobalScaleConfig
  darkScale?: GlobalScaleConfig
  systemConfig?: SystemMappingConfig
}

function applyPresetDetail(
  d: PresetDetail,
  setters: {
    setSystemConfig: (cfg: SystemMappingConfig, label: string) => void
    setNeutralArchitecture: (arch: NeutralArchitectureMode, label: string) => void
    setGlobalScale: (cfg: GlobalScaleConfig, label: string) => void
    setLightScale: (updater: (prev: GlobalScaleConfig) => GlobalScaleConfig, label: string) => void
    setDarkScale: (updater: (prev: GlobalScaleConfig) => GlobalScaleConfig, label: string) => void
  },
): void {
  if (d.systemConfig) {
    setters.setSystemConfig(migrateSystemMappingConfig(d.systemConfig), 'System mapping')
  }

  const legacyOnlyGlobal =
    Boolean(d.globalConfig) &&
    d.globalScale === undefined &&
    d.lightScale === undefined &&
    d.darkScale === undefined

  if (legacyOnlyGlobal) {
    setters.setNeutralArchitecture(
      (d.architecture ?? 'simple') as NeutralArchitectureMode,
      'Preset · load',
    )
    setters.setGlobalScale(
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
    setters.setNeutralArchitecture(d.architecture, 'Preset · architecture')
  }
  if (d.globalScale) {
    setters.setGlobalScale(
      {
        ...DEFAULT_GLOBAL_SCALE_CONFIG,
        ...d.globalScale,
        steps: clampGlobalScaleSteps(d.globalScale.steps),
      },
      'Global scale',
    )
  }
  if (d.lightScale) {
    setters.setLightScale(
      (prev) => ({...prev, ...d.lightScale, steps: clampGlobalScaleSteps(d.lightScale!.steps)}),
      'Light scale',
    )
  }
  if (d.darkScale) {
    setters.setDarkScale(
      (prev) => ({...prev, ...d.darkScale, steps: clampGlobalScaleSteps(d.darkScale!.steps)}),
      'Dark scale',
    )
  }
}

export function NeutralWorkbenchProvider({children}: {children: ReactNode}) {
  const wb = useNeutralWorkbench()
  const {
    setSystemConfig,
    setGlobalScale,
    setLightScale,
    setDarkScale,
    setNeutralArchitecture,
  } = wb

  useEffect(() => {
    const setters = {setSystemConfig, setNeutralArchitecture, setGlobalScale, setLightScale, setDarkScale}
    function onLoad(e: Event) {
      const d = (e as CustomEvent<PresetDetail>).detail
      if (!d) return
      applyPresetDetail(d, setters)
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

  return (
    <NeutralWorkbenchContext.Provider value={wb}>
      <WorkbenchThemeBridge wb={wb} />
      <LiveThemeStyles
        architecture={wb.neutralArchitecture}
        ramps={wb.architectureRamps}
        lightTokens={wb.lightTokens}
        darkTokens={wb.darkTokens}
        alphaConfig={wb.alphaConfig}
      />
      {children}
    </NeutralWorkbenchContext.Provider>
  )
}

export function useNeutralWorkbenchContext(): NeutralWorkbench {
  const wb = useContext(NeutralWorkbenchContext)
  if (!wb) {
    throw new Error(
      'useNeutralWorkbenchContext must be used within NeutralWorkbenchProvider',
    )
  }
  return wb
}

export function useNeutralWorkbenchOptional(): NeutralWorkbench | null {
  return useContext(NeutralWorkbenchContext)
}
