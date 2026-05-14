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
import {migrateSystemMappingConfig} from '@/lib/neutral-engine'
import {DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import type {
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
} from '@/lib/neutral-engine/types'

const NeutralWorkbenchContext = createContext<NeutralWorkbench | null>(null)

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
