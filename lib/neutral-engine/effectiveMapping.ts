import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

/**
 * Single source of truth for how **compact vs wide** adjusts mapping — must match
 * {@link useNeutralWorkbench} / any consumer that derives tokens from the same controls.
 *
 * Wide mode widens spacing between resolved global indices (stronger “tweener” separation).
 */
export function applyContrastModeToSystemMapping(
  base: SystemMappingConfig,
  contrastMode: 'compact' | 'wide',
): SystemMappingConfig {
  return {
    ...base,
    contrastDistance:
      contrastMode === 'wide'
        ? Math.max(base.contrastDistance * 2.1, 2)
        : base.contrastDistance,
  }
}
