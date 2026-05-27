'use client'

import {useCallback, useLayoutEffect, useMemo, useState} from 'react'

import {generateBothThemes} from '@/lib/color-engine/generate'
import {DEFAULT_HUES, PALETTE_NAMES} from '@/lib/color-engine/presetHues'
import type {
  ChromaPolicy,
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
  chromaPolicy: 'max' as const,
}))

export type ColorPalettesWorkbench = {
  palettes: PaletteConfig[]
  chromaPolicy: ChromaPolicy
  gamut: PaletteGamut
  contrastModel: ContrastModel
  generatedPalettes: GeneratedPalette[]
  setHue: (name: string, hue: number) => void
  resetHues: () => void
  setChromaPolicy: (policy: ChromaPolicy) => void
  setGamut: (gamut: PaletteGamut) => void
  setContrastModel: (model: ContrastModel) => void
}

export function useColorPalettes(): ColorPalettesWorkbench {
  const [palettes, setPalettes] = useState<PaletteConfig[]>(DEFAULT_PALETTES)
  const [chromaPolicy, setChromaPolicyBase] = useState<ChromaPolicy>('max')
  const [gamut, setGamutBase] = useState<PaletteGamut>('display-p3')
  const [contrastModel, setContrastModelBase] = useState<ContrastModel>('wcag-2.1')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => {
    const stored = readColorPalettesFromStorage()
    if (stored) {
      if (stored.palettes.length > 0) setPalettes(stored.palettes)
      setChromaPolicyBase(stored.chromaPolicy)
      setGamutBase(stored.gamut)
      setContrastModelBase(stored.contrastModel)
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
          chromaPolicy,
        }),
      })),
    [palettes, chromaPolicy, gamut],
  )

  const persist = useCallback(
    (
      nextPalettes: PaletteConfig[],
      nextPolicy: ChromaPolicy,
      nextGamut: PaletteGamut,
      nextModel: ContrastModel,
    ) => {
      writeColorPalettesToStorage({
        v: 1,
        palettes: nextPalettes,
        chromaPolicy: nextPolicy,
        gamut: nextGamut,
        contrastModel: nextModel,
      })
    },
    [],
  )

  const setHue = useCallback(
    (name: string, hue: number) => {
      setPalettes((prev) => {
        const next = prev.map((p) => (p.name === name ? {...p, hue} : p))
        persist(next, chromaPolicy, gamut, contrastModel)
        return next
      })
    },
    [chromaPolicy, gamut, contrastModel, persist],
  )

  const resetHues = useCallback(() => {
    setPalettes((prev) => {
      const next = prev.map((p) => ({...p, hue: DEFAULT_HUES[p.name]}))
      persist(next, chromaPolicy, gamut, contrastModel)
      return next
    })
  }, [chromaPolicy, gamut, contrastModel, persist])

  const setChromaPolicy = useCallback(
    (policy: ChromaPolicy) => {
      setChromaPolicyBase(policy)
      persist(palettes, policy, gamut, contrastModel)
    },
    [palettes, gamut, contrastModel, persist],
  )

  const setGamut = useCallback(
    (nextGamut: PaletteGamut) => {
      setGamutBase(nextGamut)
      persist(palettes, chromaPolicy, nextGamut, contrastModel)
    },
    [palettes, chromaPolicy, contrastModel, persist],
  )

  const setContrastModel = useCallback(
    (model: ContrastModel) => {
      setContrastModelBase(model)
      persist(palettes, chromaPolicy, gamut, model)
    },
    [palettes, chromaPolicy, gamut, persist],
  )

  return {
    palettes,
    chromaPolicy,
    gamut,
    contrastModel,
    generatedPalettes,
    setHue,
    resetHues,
    setChromaPolicy,
    setGamut,
    setContrastModel,
  }
}
