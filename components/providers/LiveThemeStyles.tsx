'use client'

import {useLayoutEffect} from 'react'

import {getLastPreset, presetDebugEnabled} from '@/lib/debug/presetDebug'
import {exportCssVariables} from '@/lib/neutral-engine/exportFormats'
import type {AlphaNeutralConfig, ArchitectureRamps, NeutralArchitectureMode, SystemToken} from '@/lib/neutral-engine/types'

const STYLE_NODE_ID = 'ns-live-tokens'

export function LiveThemeStyles({
  ramps,
  architecture,
  lightTokens,
  darkTokens,
  alphaConfig,
}: {
  ramps: ArchitectureRamps
  architecture: NeutralArchitectureMode
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  alphaConfig?: AlphaNeutralConfig
}) {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const debug = presetDebugEnabled()
    const last = debug ? getLastPreset() : undefined
    const t0 = debug ? performance.now() : 0
    const css = exportCssVariables({
      architecture,
      ramps,
      light: lightTokens,
      dark: darkTokens,
      alphaConfig,
    })
    let node = document.getElementById(STYLE_NODE_ID) as HTMLStyleElement | null
    if (!node) {
      node = document.createElement('style')
      node.id = STYLE_NODE_ID
      document.head.appendChild(node)
    }
    const changed = node.textContent !== css
    if (changed) node.textContent = css
    if (debug && last?.kind != null) {
      const dt = performance.now() - t0
      const perfLabel = last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf'
      console.log(
        perfLabel,
        'exportCssVariables (sync write)',
        JSON.stringify({ms: Number(dt.toFixed(2)), changed, cssBytes: css.length, kind: last.kind}),
      )
    }
  }, [architecture, ramps, lightTokens, darkTokens, alphaConfig])

  return null
}
