import Color from 'colorjs.io'

import {serializeColor, trimCssColorValue} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch, SerializedColor} from '@/lib/neutral-engine/types'

/** Default custom brand OKLCH (product baseline until the user edits it). */
export const DEFAULT_BRAND_OKLCH = 'oklch(69.3% 0.2546 37.91)'

export function tryParseBrandOklch(raw: string | undefined): Color | null {
  const s = trimCssColorValue(raw ?? '')
  if (!s) return null
  try {
    return new Color(s)
  } catch {
    return null
  }
}

/**
 * Resolve `surface.brand` color: valid OKLCH string → parsed color + direct CSS export;
 * invalid / empty → ramp fallback at `fallbackSwatch` (not custom).
 *
 * For custom brand, `serialized.oklchCss` is the **committed** `brandOklch` string (after
 * `trimCssColorValue`). Relying on `serializeColor(parsed).oklchCss` re-serializes through
 * Color.js and rewrites OKLCH coordinates (e.g. `oklch(69.3% 0.2546 37.91)` →
 * `oklch(67.597% 0.21739 38.786)`) for the same sRGB, which is confusing in exports/inspector and
 * can diverge from the design-spec string even when the sRGB is identical.
 */
export function resolveBrandColorForTokens(
  brandOklch: string | undefined,
  fallbackSwatch: GlobalSwatch,
): {color: Color; serialized: SerializedColor; customColor: boolean} {
  const raw = trimCssColorValue(brandOklch ?? '')
  const parsed = tryParseBrandOklch(brandOklch)
  if (parsed) {
    const ser = serializeColor(parsed)
    return {color: parsed, serialized: {...ser, oklchCss: raw || ser.oklchCss}, customColor: true}
  }
  return {
    color: fallbackSwatch.color,
    serialized: fallbackSwatch.serialized,
    customColor: false,
  }
}

/** Canonical OKLCH CSS string for storage / picker when input parses. */
export function canonicalBrandOklchCss(c: Color): string {
  return trimCssColorValue(c.to('oklch').toString({format: 'css'}))
}
