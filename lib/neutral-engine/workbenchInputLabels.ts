import type {GlobalScaleConfig, SystemMappingConfig} from '@/lib/neutral-engine/types'

/** Fallback UI label when a patch omits an explicit `label` (Title Case / product copy). */
export function labelForGlobalPatchKey<K extends keyof GlobalScaleConfig>(key: K): string {
  const map: Partial<Record<keyof GlobalScaleConfig, string>> = {
    steps: 'Steps',
    lHigh: 'Lightest L',
    lLow: 'Darkest L',
    progression: 'Progression',
    chromaMode: 'Chroma mode',
    baseChroma: 'Base Chroma',
    hue: 'Hue',
    namingStyle: 'Naming',
    variantId: 'Variant',
  }
  return map[key] ?? String(key)
}

/** Fallback UI label for system mapping patches. */
export function labelForSystemPatchKey<K extends keyof SystemMappingConfig>(key: K): string {
  const map: Partial<Record<keyof SystemMappingConfig, string>> = {
    fillStart: 'Surface start index',
    strokeStart: 'Border start index',
    textStart: 'Text start index',
    fillCount: 'Surface token count',
    strokeCount: 'Border token count',
    textCount: 'Text shade count',
    darkFillStart: 'Dark surface start index',
    darkStrokeStart: 'Dark border start index',
    darkTextStart: 'Dark text start index',
    darkFillCount: 'Dark surface token count',
    darkStrokeCount: 'Dark border token count',
    darkTextCount: 'Dark text shade count',
    lightFillStepInterval: 'Light surface step interval',
    lightStrokeStepInterval: 'Light border step interval',
    lightTextStepInterval: 'Light text step interval',
    darkFillStepInterval: 'Dark surface step interval',
    darkStrokeStepInterval: 'Dark border step interval',
    darkTextStepInterval: 'Dark text step interval',
    contrastDistance: 'Contrast distance',
    themeMode: 'Theme mode',
    darkSegmentLength: 'Dark segment length',
    altCount: 'Alt overlays',
    altAlpha: 'Alt alpha',
    includeContrastGroups: 'Contrast groups',
    brandOklch: 'Brand color (OKLCH)',
  }
  return map[key] ?? String(key)
}
