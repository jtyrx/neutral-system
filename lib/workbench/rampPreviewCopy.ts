/**
 * Single source for neutral ramp preview copy shared by the workbench preview
 * and dock ramp cards.
 *
 * Preview lane chrome maps light → amber mixers and dark elevated → sky mixers;
 * {@link previewChromeToneForRampLane} matches the preview panel tone union (`'amber' | 'sky'`).
 */

import type {NeutralArchitectureMode} from '@/lib/neutral-engine'

/** Dark ramps are black-first in the engine, so the strip naturally reads dark → light L→R. */
export const INVERT_DARK_RAMP_STRIP = false as const

export type RampPreviewLane = 'light' | 'dark'

export function previewChromeToneForRampLane(
  lane: RampPreviewLane,
): 'amber' | 'sky' {
  return lane === 'light' ? 'amber' : 'sky'
}

export function swatchesBadgeLabel(count: number): string {
  return `${count} swatch${count === 1 ? '' : 'es'}`
}

function isSimpleArchitecture(arch: NeutralArchitectureMode): boolean {
  return arch === 'simple'
}

// --- Split layout (PreviewComparison two-column) ---

export function rampWorkbenchSplitLightCaption(
  arch: NeutralArchitectureMode,
): string {
  return isSimpleArchitecture(arch)
    ? 'Light · global ramp (low index = lightest)'
    : 'Light neutral scale (low index = lightest)'
}

export function rampWorkbenchSplitDarkCaption(
  arch: NeutralArchitectureMode,
): string {
  return isSimpleArchitecture(arch)
    ? 'Dark elevated · global ramp (black-first)'
    : 'Dark neutral scale (dark-0 = darkest)'
}

export function rampWorkbenchSplitLightDirection(): string {
  return 'Ramp reads light → dark (low → high index).'
}

export function rampWorkbenchSplitDarkDirection(
  arch: NeutralArchitectureMode,
): string {
  return isSimpleArchitecture(arch)
    ? 'Dark virtual ramp reads dark → light (low index = darkest).'
    : 'Dark sibling ramp reads dark → light (low index = darkest); semantic picks anchor from dark-0.'
}

export function rampWorkbenchSplitCardTitle(
  arch: NeutralArchitectureMode,
): string {
  return isSimpleArchitecture(arch) ? 'Global ramp' : 'Neutral scale'
}

// --- Focus layout (single large preview) ---

export function rampWorkbenchFocusCaption(
  arch: NeutralArchitectureMode,
  lane: RampPreviewLane,
): string {
  const simple = isSimpleArchitecture(arch)
  const isLight = lane === 'light'
  if (simple) {
    return isLight
      ? 'Light · global ramp (low index = lightest)'
      : 'Dark elevated · global ramp (black-first)'
  }
  return isLight
    ? 'Light neutral scale (low index = lightest)'
    : 'Dark neutral scale (dark-0 = darkest)'
}

export function rampWorkbenchFocusDirection(
  arch: NeutralArchitectureMode,
  lane: RampPreviewLane,
): string {
  const simple = isSimpleArchitecture(arch)
  const isLight = lane === 'light'
  if (simple) {
    return isLight
      ? 'Ramp reads light → dark (low → high index).'
      : 'Dark virtual ramp reads dark → light (low → high index).'
  }
  return isLight
    ? 'Light sibling ramp reads light → dark (low → high index).'
    : 'Dark sibling ramp reads dark → light — dark-0 is the darkest step.'
}

export function rampWorkbenchFocusEyebrow(lane: RampPreviewLane): string {
  return lane === 'light' ? 'Light' : 'Dark elevated'
}

// --- Dock picker ramp chrome block (may differ slightly in heading copy) ---

export function dockPickerRampEyebrow(lane: RampPreviewLane): string {
  return lane === 'light' ? 'Light' : 'Dark elevated'
}

export function dockPickerRampTitle(
  arch: NeutralArchitectureMode,
  lane: RampPreviewLane,
): string {
  if (lane === 'light') {
    return isSimpleArchitecture(arch) ? 'Global ramp' : 'Light Neutral scale'
  }
  return isSimpleArchitecture(arch) ? 'Global ramp' : 'Dark Neutral scale'
}

export function dockPickerRampCaption(
  arch: NeutralArchitectureMode,
  lane: RampPreviewLane,
): string {
  return lane === 'light'
    ? rampWorkbenchSplitLightCaption(arch)
    : rampWorkbenchSplitDarkCaption(arch)
}

export function dockPickerRampDirection(
  arch: NeutralArchitectureMode,
  lane: RampPreviewLane,
): string {
  return lane === 'light'
    ? rampWorkbenchSplitLightDirection()
    : rampWorkbenchSplitDarkDirection(arch)
}

export type DockPickerRampChromeCopy = {
  tone: 'amber' | 'sky'
  effectivePreviewTheme: RampPreviewLane
  caption: string
  directionHint: string
  eyebrow: string
  title: string
  badgeLabel: string
}

export function dockPickerRampChromeCopyModel(opts: {
  neutralArchitecture: NeutralArchitectureMode
  effectivePreviewTheme: RampPreviewLane
  swatchCount: number
}): DockPickerRampChromeCopy {
  const {neutralArchitecture, effectivePreviewTheme, swatchCount} = opts
  return {
    tone: previewChromeToneForRampLane(effectivePreviewTheme),
    effectivePreviewTheme,
    caption: dockPickerRampCaption(neutralArchitecture, effectivePreviewTheme),
    directionHint: dockPickerRampDirection(
      neutralArchitecture,
      effectivePreviewTheme,
    ),
    eyebrow: dockPickerRampEyebrow(effectivePreviewTheme),
    title: dockPickerRampTitle(neutralArchitecture, effectivePreviewTheme),
    badgeLabel: swatchesBadgeLabel(swatchCount),
  }
}
