'use client'

import {useCallback, useLayoutEffect, useMemo, useState} from 'react'

import {generateBothThemes} from '@/lib/color-engine/generate'
import {DEFAULT_HUES, PALETTE_NAMES} from '@/lib/color-engine/presetHues'
import {DARK_L, LIGHT_L} from '@/lib/color-engine/presetLightness'
import type {
  GeneratedPalette,
  PaletteConfig,
  PaletteGamut,
} from '@/lib/color-engine/types'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import {
  readColorPalettesFromStorage,
  writeColorPalettesToStorage,
} from '@/lib/color-palettes/colorPalettesStorage'

const DEFAULT_PALETTES: PaletteConfig[] = PALETTE_NAMES.map((name) => ({
  name,
  hue: DEFAULT_HUES[name],
}))

export type ColorPalettesWorkbench = {
  palettes: PaletteConfig[]
  gamut: PaletteGamut
  contrastModel: ContrastModel
  lightStops: number[]
  darkStops: number[]
  generatedPalettes: GeneratedPalette[]
  setHue: (name: string, hue: number) => void
  resetHues: () => void
  setGamut: (gamut: PaletteGamut) => void
  setContrastModel: (model: ContrastModel) => void
  setLightStop: (index: number, value: number) => void
  setDarkStop: (index: number, value: number) => void
  resetStops: () => void
}

export function useColorPalettes(): ColorPalettesWorkbench {
  const [palettes, setPalettes] = useState<PaletteConfig[]>(DEFAULT_PALETTES)
  const [gamut, setGamutBase] = useState<PaletteGamut>('display-p3')
  const [contrastModel, setContrastModelBase] = useState<ContrastModel>('wcag-2.1')
  const [lightStops, setLightStopsBase] = useState<number[]>([...LIGHT_L])
  const [darkStops, setDarkStopsBase] = useState<number[]>([...DARK_L])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => {
    const stored = readColorPalettesFromStorage()
    if (stored) {
      if (stored.palettes.length > 0) setPalettes(stored.palettes)
      setGamutBase(stored.gamut)
      setContrastModelBase(stored.contrastModel)
      setLightStopsBase(stored.lightStops)
      setDarkStopsBase(stored.darkStops)
    }
  }, [])

  const generatedPalettes = useMemo<GeneratedPalette[]>(
    () =>
      palettes.map((config) => ({
        config,
        ...generateBothThemes({
          name: config.name,
          hue: config.hue,
          gamut,
          lightness: lightStops,
          darkness: darkStops,
        }),
      })),
    [palettes, gamut, lightStops, darkStops],
  )

  const persist = useCallback(
    (
      nextPalettes: PaletteConfig[],
      nextGamut: PaletteGamut,
      nextModel: ContrastModel,
      nextLightStops: number[],
      nextDarkStops: number[],
    ) => {
      writeColorPalettesToStorage({
        v: 1,
        palettes: nextPalettes,
        gamut: nextGamut,
        contrastModel: nextModel,
        lightStops: nextLightStops,
        darkStops: nextDarkStops,
      })
    },
    [],
  )

  const setHue = useCallback(
    (name: string, hue: number) => {
      setPalettes((prev) => {
        const next = prev.map((p) => (p.name === name ? {...p, hue} : p))
        persist(next, gamut, contrastModel, lightStops, darkStops)
        return next
      })
    },
    [gamut, contrastModel, lightStops, darkStops, persist],
  )

  const resetHues = useCallback(() => {
    setPalettes((prev) => {
      const next = prev.map((p) => ({...p, hue: DEFAULT_HUES[p.name]}))
      persist(next, gamut, contrastModel, lightStops, darkStops)
      return next
    })
  }, [gamut, contrastModel, lightStops, darkStops, persist])

  const setGamut = useCallback(
    (nextGamut: PaletteGamut) => {
      setGamutBase(nextGamut)
      persist(palettes, nextGamut, contrastModel, lightStops, darkStops)
    },
    [palettes, contrastModel, lightStops, darkStops, persist],
  )

  const setContrastModel = useCallback(
    (model: ContrastModel) => {
      setContrastModelBase(model)
      persist(palettes, gamut, model, lightStops, darkStops)
    },
    [palettes, gamut, lightStops, darkStops, persist],
  )

  const setLightStop = useCallback(
    (index: number, value: number) => {
      setLightStopsBase((prev) => {
        const next = prev.map((v, i) => (i === index ? value : v))
        persist(palettes, gamut, contrastModel, next, darkStops)
        return next
      })
    },
    [palettes, gamut, contrastModel, darkStops, persist],
  )

  const setDarkStop = useCallback(
    (index: number, value: number) => {
      setDarkStopsBase((prev) => {
        const next = prev.map((v, i) => (i === index ? value : v))
        persist(palettes, gamut, contrastModel, lightStops, next)
        return next
      })
    },
    [palettes, gamut, contrastModel, lightStops, persist],
  )

  const resetStops = useCallback(() => {
    const nextLight = [...LIGHT_L]
    const nextDark = [...DARK_L]
    setLightStopsBase(nextLight)
    setDarkStopsBase(nextDark)
    persist(palettes, gamut, contrastModel, nextLight, nextDark)
  }, [palettes, gamut, contrastModel, persist])

  return {
    palettes,
    gamut,
    contrastModel,
    lightStops,
    darkStops,
    generatedPalettes,
    setHue,
    resetHues,
    setGamut,
    setContrastModel,
    setLightStop,
    setDarkStop,
    resetStops,
  }
}
