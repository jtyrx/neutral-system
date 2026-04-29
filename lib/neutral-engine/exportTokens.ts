import {isEmphasisToken, isPreviewOnlyBrandToken} from '@/lib/neutral-engine/exportFormats'
import type {SystemToken} from '@/lib/neutral-engine/types'

/** Downloadable export surfaces (see `isPreviewOnlyBrandToken` / `isEmphasisToken`). */
export type TokenExportChannel = 'json' | 'css' | 'tailwind'

/**
 * Single entrypoint for which `SystemToken`s appear in downloadable payloads.
 * Live `LiveThemeStyles` should pass **unfiltered** tokens so preview + brand stay accurate.
 */
export function tokensForExportChannel(
  tokens: SystemToken[],
  channel: TokenExportChannel,
): SystemToken[] {
  const noPreviewBrand = tokens.filter((t) => !isPreviewOnlyBrandToken(t))
  if (channel === 'json') {
    return noPreviewBrand.filter((t) => !isEmphasisToken(t))
  }
  return noPreviewBrand
}
