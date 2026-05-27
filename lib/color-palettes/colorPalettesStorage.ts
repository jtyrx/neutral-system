import type {PaletteConfig, PaletteGamut, PaletteName} from '@/lib/color-engine/types'
import {DARK_L, LIGHT_L} from '@/lib/color-engine/presetLightness'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'

const STORAGE_KEY = 'color-palettes:workbench:v1'

export type ColorPalettesPersistedV1 = {
  v: 1
  palettes: PaletteConfig[]
  gamut: PaletteGamut
  contrastModel: ContrastModel
  lightStops: number[]
  darkStops: number[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isPaletteName(v: unknown): v is PaletteName {
  return v === 'blue' || v === 'green' || v === 'orange' || v === 'yellow' || v === 'red' || v === 'purple'
}

function isPaletteGamut(v: unknown): v is PaletteGamut {
  return v === 'srgb' || v === 'display-p3' || v === 'rec2020'
}

function isContrastModel(v: unknown): v is ContrastModel {
  return v === 'wcag-2.1' || v === 'apca'
}

function coerceLStops(v: unknown, fallback: readonly number[]): number[] {
  if (!Array.isArray(v) || v.length !== fallback.length) return [...fallback]
  if (!v.every((x) => typeof x === 'number' && x >= 0 && x <= 1)) return [...fallback]
  return v as number[]
}

function coercePaletteConfig(v: unknown): PaletteConfig | null {
  if (!isRecord(v)) return null
  if (!isPaletteName(v.name)) return null
  if (typeof v.hue !== 'number' || !Number.isFinite(v.hue)) return null
  return {name: v.name, hue: v.hue}
}

export function parseColorPalettesStorage(
  raw: string | null,
): ColorPalettesPersistedV1 | null {
  if (raw == null || raw === '') return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.v !== 1) return null
    const palettes = Array.isArray(parsed.palettes)
      ? (parsed.palettes.map(coercePaletteConfig).filter(Boolean) as PaletteConfig[])
      : []
    const gamut = isPaletteGamut(parsed.gamut) ? parsed.gamut : 'display-p3'
    const contrastModel = isContrastModel(parsed.contrastModel) ? parsed.contrastModel : 'wcag-2.1'
    const lightStops = coerceLStops(parsed.lightStops, LIGHT_L)
    const darkStops = coerceLStops(parsed.darkStops, DARK_L)
    return {v: 1, palettes, gamut, contrastModel, lightStops, darkStops}
  } catch {
    return null
  }
}

export function readColorPalettesFromStorage(): ColorPalettesPersistedV1 | null {
  if (typeof window === 'undefined') return null
  try {
    return parseColorPalettesStorage(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeColorPalettesToStorage(payload: ColorPalettesPersistedV1): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode — ignore
  }
}
