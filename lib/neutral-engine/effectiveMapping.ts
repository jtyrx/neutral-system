import type {ContrastEmphasis} from '@/lib/neutral-engine/semanticNaming'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

/**
 * Maps contrast **emphasis** (subtle → inverse) onto `contrastDistance` so resolved ramp spacing
 * matches preview, system mapping UI, and exports.
 *
 * - **subtle** — tightest spacing (baseline multiplier 1).
 * - **default** / **strong** — stepped widening.
 * - **inverse** — strongest separation (matches legacy “wide”, including min distance guard).
 */
const EMPHASIS_MULTIPLIER: Record<ContrastEmphasis, number> = {
  subtle: 1,
  default: 1.2,
  strong: 1.55,
  inverse: 2.1,
}

export function applyContrastEmphasisToSystemMapping(
  base: SystemMappingConfig,
  emphasis: ContrastEmphasis,
): SystemMappingConfig {
  const m = EMPHASIS_MULTIPLIER[emphasis]
  const scaled = base.contrastDistance * m
  const contrastDistance =
    emphasis === 'inverse' ? Math.max(scaled, 2) : scaled
  return {
    ...base,
    contrastDistance,
  }
}

/** @deprecated Use {@link applyContrastEmphasisToSystemMapping} with migrated emphasis. */
export function applyContrastModeToSystemMapping(
  base: SystemMappingConfig,
  contrastMode: 'compact' | 'wide',
): SystemMappingConfig {
  const emphasis: ContrastEmphasis = contrastMode === 'wide' ? 'inverse' : 'subtle'
  return applyContrastEmphasisToSystemMapping(base, emphasis)
}
