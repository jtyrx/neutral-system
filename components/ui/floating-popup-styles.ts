import { cn } from '@/lib/utils'

/**
 * Shared Tailwind recipes for Base UI floating Popup layers (select menu, popover,
 * dropdown menu, tooltip). Static strings for Tailwind v4 CSS-first compilation.
 */

/** Zoom + fade open/close — select, popover, dropdown menu, tooltip. */
export const floatingPopupOpenClose =
  'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'

/** Slide entrance for side + logical inline axes (select + popover). */
export const floatingPopupSlideAllSides =
  'data-[side=bottom]:slide-in-from-top-8 data-[side=inline-end]:slide-in-from-left-8 data-[side=inline-start]:slide-in-from-right-8 data-[side=left]:slide-in-from-right-8 data-[side=right]:slide-in-from-left-8 data-[side=top]:slide-in-from-bottom-8'

export const floatingPopupTransitionDuration = 'duration-100'

/** Elevated list/popover shell: popover + select content (not plain menu surface). */
export const popoverElevatedSurface =
  'rounded-select bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10'

/**
 * TooltipPrimitive.Popup outer shell: no own background so the caret composes with inner fill under
 * one `filter` stack. Elevation uses black alpha (not `--color-foreground`) so shadows stay visible on dark UI.
 */
const tooltipPopupShell =
  'z-50 isolate relative flex w-fit max-w-xs flex-col overflow-visible p-0 antialiased has-data-[slot=kbd]:pr-6 [filter:drop-shadow(0_12px_28px_-6px_color-mix(in_oklch,black_48%,transparent))_drop-shadow(0_6px_14px_-4px_color-mix(in_oklch,black_34%,transparent))_drop-shadow(0_0_0_1px_color-mix(in_oklch,var(--color-border)_90%,transparent))_drop-shadow(0_0_14px_color-mix(in_oklch,black_22%,transparent))]'

/** Inner rounded panel: fill only; hairline + elevation come from tooltipPopupShell filter. */
export const tooltipPopupInnerSurface =
  'relative z-0 min-h-0 min-w-0 w-full flex flex-1 flex-col rounded-menu bg-popover/92 text-popover-foreground'

/** Padding for tooltip body; applied inside tooltipPopupInnerSurface. */
export const tooltipPopupBodyPadding = 'px-12 py-8'

/** Tooltip uses physical sides only (matches previous tooltip.tsx). */
export const tooltipPopupInnerShell =
  'data-[side=bottom]:slide-in-from-top-8 data-[side=left]:slide-in-from-right-8 data-[side=right]:slide-in-from-left-8 data-[side=top]:slide-in-from-bottom-8 w-full overflow-visible rounded-menu border border-hairline ring-ring/20 supports-backdrop-filter:backdrop-blur-sm'

export const tooltipPopupStartingStyle =
  'data-starting-style:animate-in data-starting-style:fade-in-0 data-starting-style:zoom-in-95'

const tooltipPopupKbdSlot =
  'origin-(--transform-origin) **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm'

/** Default tooltip popup classes (caller merges `className`). */
export const tooltipPopupContentBaseClassName = cn(
  tooltipPopupShell,
  tooltipPopupInnerShell,
  tooltipPopupKbdSlot,
  tooltipPopupStartingStyle,
  floatingPopupOpenClose,
)
