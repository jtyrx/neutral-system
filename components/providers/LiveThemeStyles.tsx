'use client'

import {useEffect, useLayoutEffect} from 'react'

import {exportCssVariables} from '@/lib/neutral-engine/exportFormats'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

const STYLE_NODE_ID = 'ns-live-tokens'

/**
 * Mounts the engine's resolved `--color-*` variables as a single `<style id="ns-live-tokens">`
 * in `document.head`, and mirrors `themeMode` onto `<html>` via `data-theme` + `color-scheme`.
 *
 * This is the bridge between the workbench inputs (Scale / Custom Brand / Contrast / Theme Table)
 * and everything that reads the alias layer (`--ns-*` chrome, previews, Tailwind `bg-*`/`text-*`).
 *
 * Using `useLayoutEffect` for the stylesheet guarantees the vars exist before the first paint so
 * chrome never flashes the default (pre-theme) colors on mount or on a theme flip.
 */
export function LiveThemeStyles({
  global,
  lightTokens,
  darkTokens,
  themeMode,
}: {
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  themeMode: 'light' | 'dark'
}) {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const css = exportCssVariables({global, light: lightTokens, dark: darkTokens})
    let node = document.getElementById(STYLE_NODE_ID) as HTMLStyleElement | null
    if (!node) {
      node = document.createElement('style')
      node.id = STYLE_NODE_ID
      document.head.appendChild(node)
    }
    if (node.textContent !== css) node.textContent = css
  }, [global, lightTokens, darkTokens])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.dataset.theme = themeMode
    root.style.colorScheme = themeMode
  }, [themeMode])

  return null
}
