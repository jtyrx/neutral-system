'use client'

import {useLayoutEffect} from 'react'

import {getLastPreset, presetDebugEnabled} from '@/lib/debug/presetDebug'
import {exportCssVariables} from '@/lib/neutral-engine/exportFormats'
import type {AlphaNeutralConfig, GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

const STYLE_NODE_ID = 'ns-live-tokens'

/**
 * Mounts the engine's resolved `--color-*` variables as a single `<style id="ns-live-tokens">`
 * in `document.head`.
 *
 * This is the bridge between the workbench inputs (Scale / Custom Brand / Contrast / Theme Table)
 * and tier-1/Tailwind consumption (`--neutral-*`, legacy `--color-neutral-*`, `--color-*`, `--chrome-*`).
 * Legacy `--ns-*` aliases in `globals.css` continue to resolve via `var(--color-*)`.
 *
 * Scheduling: `exportCssVariables` writes via `useLayoutEffect`. `useEffect` is flushed via
 *   `MessageChannel`/`setTimeout(0)`, both of which Chromium clamps to 1 Hz when the
 *   browser window is unfocused — that turns a <5ms engine update into a 1000–1700ms
 *   visible stall. `useLayoutEffect` runs synchronously in the commit phase before the
 *   browser yields and is NOT subject to that throttle, so preset clicks paint in the
 *   next frame regardless of focus state.
 */
export function LiveThemeStyles({
  global,
  lightTokens,
  darkTokens,
  alphaConfig,
}: {
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  alphaConfig?: AlphaNeutralConfig
}) {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const debug = presetDebugEnabled()
    const last = debug ? getLastPreset() : undefined
    const t0 = debug ? performance.now() : 0
    const css = exportCssVariables({global, light: lightTokens, dark: darkTokens, alphaConfig})
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
  }, [global, lightTokens, darkTokens, alphaConfig])

  return null
}
