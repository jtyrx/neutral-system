import type {ChromaPolicy, PaletteConfig, PaletteGamut, PaletteName} from '@/lib/color-engine/types'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'

const STORAGE_KEY = 'color-palettes:workbench:v1'

export type ColorPalettesPersistedV1 = {
  v: 1
  palettes: PaletteConfig[]
  chromaPolicy: ChromaPolicy
  gamut: PaletteGamut
  contrastModel: ContrastModel
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isPaletteName(v: unknown): v is PaletteName {
  return v === 'blue' || v === 'green' || v === 'orange' || v === 'yellow' || v === 'red' || v === 'purple'
}

function isChromaPolicy(v: unknown): v is ChromaPolicy {
  return v === 'max' || v === 'even'
}

function isPaletteGamut(v: unknown): v is PaletteGamut {
  return v === 'srgb' || v === 'display-p3'
}

function isContrastModel(v: unknown): v is ContrastModel {
  return v === 'wcag-2.1' || v === 'apca'
}

function coercePaletteConfig(v: unknown): PaletteConfig | null {
  if (!isRecord(v)) return null
  if (!isPaletteName(v.name)) return null
  if (typeof v.hue !== 'number' || !Number.isFinite(v.hue)) return null
  if (!isChromaPolicy(v.chromaPolicy)) return null
  return {name: v.name, hue: v.hue, chromaPolicy: v.chromaPolicy}
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
    const chromaPolicy = isChromaPolicy(parsed.chromaPolicy) ? parsed.chromaPolicy : 'max'
    const gamut = isPaletteGamut(parsed.gamut) ? parsed.gamut : 'display-p3'
    const contrastModel = isContrastModel(parsed.contrastModel) ? parsed.contrastModel : 'wcag-2.1'
    return {v: 1, palettes, chromaPolicy, gamut, contrastModel}
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
