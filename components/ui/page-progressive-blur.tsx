import type {CSSProperties} from 'react'

import {
  layerBlurRadiiPx,
  linearGradientAxisForDirection,
  linearGradientMaskStops,
  type BlurCurve,
} from '@/lib/effects/progressiveBlurStack'
import {cn} from '@/lib/utils'

export type PageProgressiveBlurProps = {
  direction?: 'top' | 'bottom' | 'left' | 'right'
  layerCount?: number
  maxBlurPx?: number
  featherPx?: number
  curve?: BlurCurve
  /** Multiplier on mask segment width (≈0.92–1.08) — slightly overlaps plateaus to hide seams. */
  tension?: number
  /** Host `border-radius` (blur clips when `overflow: hidden`). */
  radius?: string
  className?: string
  /** Solid / translucent scrim when progressive blur is disabled (a11y + no-backdrop). */
  fallbackClassName?: string
  /** Optional tint wash above blur stacks (percent mix with `--color-background`). */
  tintOpacityPercent?: number
  /** Optional extra tint utility classes (applied after `tintOpacityPercent`). */
  tintClassName?: string
}

/**
 * **Page progressive blur** — stacked `backdrop-filter` layers with per-layer linear
 * gradient masks (directional feather).
 *
 * ### Audit (this repo)
 * There is no historical Framer / Motion-Primitives `ProgressiveBlur` here; dock and
 * dialogs previously used single-class `backdrop-blur-*` plus box-shadow. This
 * component implements the production stacked-mask pattern from the design field guide.
 *
 * ### `backdrop-filter` roots
 * [`app/layout.tsx`](../../app/layout.tsx) wraps the tree in `isolate`, which defines a
 * backdrop root. If the scrim samples "empty" content, move it or adjust stacking so it
 * sits where the intended backdrop lives (often as a direct `body` child via a portal).
 *
 * ### Chromium caveat
 * `border-radius` + `overflow: hidden` + nested `backdrop-filter` can fail to blur in
 * some Chrome builds — QA rounded hosts on desktop Chrome.
 *
 * Styling hooks: `ns-page-progressive-blur` + `[data-pb-layer]` in `app/globals.css`
 * (reduced-transparency fallbacks).
 */
export function PageProgressiveBlur({
  direction = 'bottom',
  layerCount = 6,
  maxBlurPx = 16,
  featherPx = 96,
  curve = 'exponential',
  tension = 1,
  radius = '0px',
  className,
  fallbackClassName = 'bg-(--color-surface-sunken)/88',
  tintClassName,
  tintOpacityPercent,
}: PageProgressiveBlurProps) {
  const n = Math.min(8, Math.max(4, Math.round(layerCount)))
  const radii = layerBlurRadiiPx(n, maxBlurPx, curve)
  const axis = linearGradientAxisForDirection(direction)

  const hostStyle: CSSProperties = {
    borderRadius: radius,
    ['--ppb-feather' as string]: `${featherPx}px`,
  }

  return (
    <div
      aria-hidden
      data-slot="page-progressive-blur"
      className={cn(
        'ns-page-progressive-blur pointer-events-none isolate overflow-hidden',
        direction === 'left' || direction === 'right'
          ? 'h-full min-h-0 w-[length:var(--ppb-feather)]'
          : 'min-h-0 w-full',
        direction === 'top' || direction === 'bottom' ? 'h-[length:var(--ppb-feather)]' : '',
        className,
      )}
      style={hostStyle}
    >
      <div
        data-pb-fallback
        className={cn('pointer-events-none absolute inset-0 z-0', fallbackClassName)}
      />
      {tintOpacityPercent != null && tintOpacityPercent > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            backgroundColor: `color-mix(in oklch, var(--color-background) ${tintOpacityPercent}%, transparent)`,
          }}
        />
      ) : null}
      {tintClassName ? (
        <div
          className={cn('pointer-events-none absolute inset-0 z-[2]', tintClassName)}
        />
      ) : null}
      {radii.map((blurPx, i) => (
        <div
          key={i}
          data-pb-layer
          data-pb-layer-index={i}
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            backdropFilter: `blur(${blurPx}px)`,
            WebkitBackdropFilter: `blur(${blurPx}px)`,
            maskImage: `linear-gradient(${axis}, ${linearGradientMaskStops(i, n, tension)})`,
            WebkitMaskImage: `linear-gradient(${axis}, ${linearGradientMaskStops(i, n, tension)})`,
          }}
        />
      ))}
    </div>
  )
}

export type PageProgressiveBlurDirection = NonNullable<
  PageProgressiveBlurProps['direction']
>
