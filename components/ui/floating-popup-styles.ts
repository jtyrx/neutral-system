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
  'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

export const floatingPopupTransitionDuration = 'duration-100'

/** Elevated list/popover shell: popover + select content (not plain menu surface). */
export const popoverElevatedSurface =
  'rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10'

const tooltipPopupChrome =
  'z-50 inline-flex w-fit max-w-xs flex-row items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs leading-normal tracking-normal antialiased text-background has-data-[slot=kbd]:pr-1.5'

/** Tooltip uses physical sides only (matches previous tooltip.tsx). */
export const tooltipPopupSlideSides =
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

export const tooltipPopupStartingStyle =
  'data-starting-style:animate-in data-starting-style:fade-in-0 data-starting-style:zoom-in-95'

const tooltipPopupKbdSlot =
  'origin-(--transform-origin) **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm'

/** Default tooltip popup classes (caller merges `className`). */
export const tooltipPopupContentBaseClassName = cn(
  tooltipPopupChrome,
  tooltipPopupSlideSides,
  tooltipPopupKbdSlot,
  tooltipPopupStartingStyle,
  floatingPopupOpenClose,
)
