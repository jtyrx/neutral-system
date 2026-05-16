/**
 * Shared class string for primary dock action buttons (OKLCH launcher, theme cycle, ramp range).
 * Consumed by DockActionButton and DockRampRangeButton so both stay pixel-identical.
 */
export const dockActionClassName =
  'size-11 shrink-0 touch-manipulation rounded-dock-item border-[color:var(--chrome-hairline)] bg-raised text-default backdrop-blur-none hover:bg-overlay hover:text-default active:bg-[color-mix(in_oklch,var(--color-surface-overlay)_92%,var(--color-text-default))] focus-visible:border-[color:var(--ring)] focus-visible:shadow-[var(--shadow-raised),0_0_0_3px_color-mix(in_oklch,var(--ring)_35%,transparent)] [&_svg]:size-[1.125rem]'
