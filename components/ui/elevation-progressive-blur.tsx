import type {CSSProperties, ReactNode} from 'react'

import {
  layerBlurRadiiPx,
  linearGradientAxisForDirection,
  linearGradientMaskStops,
  type BlurCurve,
} from '@/lib/effects/progressiveBlurStack'
import {cn} from '@/lib/utils'

function haloMaskForLayer(
  layerIndex: number,
  layerCount: number,
  bias: 'bottom' | 'uniform',
  softness: number,
  tension: number,
): string {
  const n = layerCount
  if (bias === 'bottom') {
    const axis = linearGradientAxisForDirection('bottom')
    return `linear-gradient(${axis}, ${linearGradientMaskStops(layerIndex, n, tension)})`
  }
  const inner = Math.min(
    78,
    softness * 0.45 + (layerIndex / Math.max(1, n - 1)) * (52 - softness * 0.2),
  )
  return `radial-gradient(ellipse 96% 96% at 50% 50%, transparent ${inner}%, #000 100%)`
}

export type ElevationProgressiveBlurProps = {
  children: ReactNode
  spread?: number
  layerCount?: number
  maxBlurPx?: number
  curve?: BlurCurve
  tension?: number
  /** Match the elevated child's border-radius (CSS length). */
  radius?: string
  /** `bottom` biases the halo toward a bottom-anchored dock; `uniform` is popup-ish. */
  bias?: 'bottom' | 'uniform'
  /** Inner transparent radius for uniform bias (roughly 24–52). */
  softness?: number
  className?: string
  haloClassName?: string
}

/**
 * **Shadow-mask progressive blur** — stacked backdrop layers masked into a soft halo
 * around elevated children (dock, dialogs). Real elevation shadow stays on the child;
 * this envelope only modulates how much **backdrop** bleeds around the silhouette.
 *
 * See `PageProgressiveBlur` for audit notes, backdrop-root guidance, and Chromium
 * `border-radius` caveats.
 */
export function ElevationProgressiveBlur({
  children,
  spread = 24,
  layerCount = 5,
  maxBlurPx = 14,
  curve = 'exponential',
  tension = 1,
  radius = '1rem',
  bias = 'bottom',
  softness = 40,
  className,
  haloClassName,
}: ElevationProgressiveBlurProps) {
  const n = Math.min(8, Math.max(4, Math.round(layerCount)))
  const radii = layerBlurRadiiPx(n, maxBlurPx, curve)

  const haloPos: CSSProperties = {
    top: -spread,
    left: -spread,
    right: -spread,
    bottom: -spread,
    borderRadius: `calc(${radius} + ${Math.max(4, spread * 0.35)}px)`,
  }

  return (
    <div
      data-slot="elevation-progressive-blur"
      className={cn('relative', className)}
    >
      <div
        aria-hidden
        className={cn(
          'ns-elevation-progressive-blur pointer-events-none absolute z-0 overflow-visible',
          haloClassName,
        )}
        style={haloPos}
      >
        {radii.map((blurPx, i) => {
          const mask = haloMaskForLayer(i, n, bias, softness, tension)
          return (
            <div
              key={i}
              data-pb-layer
              data-pb-layer-index={i}
              className="pointer-events-none absolute inset-0"
              style={{
                backdropFilter: `blur(${blurPx}px)`,
                WebkitBackdropFilter: `blur(${blurPx}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          )
        })}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
