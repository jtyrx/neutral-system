import {cn} from '@/lib/cn'
import {RampSemanticLaneGridRows} from '@/components/preview/rampSemanticLanes'
import {tokensForSemanticLanes} from '@/components/preview/laneBadges'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  tokenView: TokenView
  /** Shown above the strip (e.g. “Light · global ramp”). */
  caption: string
  /** Accent for focus ring / column chrome. */
  accentClassName?: string | undefined
  /**
   * When true, render swatches in reverse index order (presentation only; indices and token lookups unchanged).
   * Used for dark-theme ramps so the visual reads dark→light alongside light-theme light→dark.
   */
  invertDisplay?: boolean | undefined
  /** Global index of the alpha base swatch — renders a violet “Aα” badge when set. */
  alphaBaseIndex?: number | undefined
}

/** When `true`, split the ramp into two balanced horizontal segments (~half width each) for long ladders. */
function shouldWrapScaleRows(length: number): boolean {
  return length > 24
}

/** Display order preserves absolute `swatch.index`; order only changes visual traversal. */
function displayOrderedSwatches(global: GlobalSwatch[], invertDisplay: boolean): GlobalSwatch[] {
  return invertDisplay ? [...global].reverse() : global
}

/**
 * Stable segments — each contiguous slice of display-ordered swatches.
 * Uses balanced halves matching the previous ⌈n/2⌉-column layout behavior.
 */
function segmentsForDisplay(swatchesOrdered: GlobalSwatch[]): GlobalSwatch[][] {
  const n = swatchesOrdered.length
  if (n === 0) return []
  if (!shouldWrapScaleRows(n)) {
    return [swatchesOrdered]
  }
  const mid = Math.ceil(n / 2)
  const first = swatchesOrdered.slice(0, mid)
  const rest = swatchesOrdered.slice(mid)
  return rest.length > 0 ? [first, rest] : [first]
}

/** Full global ramp: one shared grid per segment — swatch row, then surface / border / text / alpha rows (no visible lane labels; badges encode role). Long ladders wrap into two balanced segments. */
export function GlobalScaleStrip({
  global,
  tokenView,
  caption,
  accentClassName,
  invertDisplay = false,
  alphaBaseIndex,
}: Props) {
  const rolesByIndex = tokenView.byGlobalIndex

  const len = global.length
  if (len === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline-strong p-16 text-center text-xs text-muted">
        No swatches — check global scale configuration.
      </div>
    )
  }

  const stripId =
    tokenView.sortedForTable[0]?.theme === 'darkElevated'
      ? 'dark-global-scale-strip'
      : 'light-global-scale-strip'

  const orderedSwatches = displayOrderedSwatches(global, invertDisplay)
  const segments = segmentsForDisplay(orderedSwatches)

  const getDisplayIdx = (swatchIndex: number) => swatchIndex

  return (
    <div className="space-y-8">
      <p className="text-micro font-medium tracking-wide text-muted">
        {caption}
      </p>
      <div
        id={stripId}
        role="group"
        aria-label="Global ramp: color ramp and semantic lanes (surface, border, text, alpha)"
        className={cn(
          'w-full overflow-x-auto rounded-xl border border-hairline bg-raised p-8',
          accentClassName,
        )}
      >
        <div className="flex min-w-0 flex-col gap-12">
          {segments.map((segment, segIdx) => {
            const cols = segment.length <= 0 ? 1 : segment.length
            const rangeLabel =
              segment.length > 0
                ? `${segment[0]!.index}→${segment[segment.length - 1]!.index}`
                : ''
            const groupId = `${stripId}-segment-${segIdx}`
            const perColumnLanes = segment.map((sw) =>
              tokensForSemanticLanes(rolesByIndex.get(sw.index) ?? []),
            )

            return (
              <div
                key={groupId}
                id={groupId}
                role="group"
                aria-label={
                  segments.length > 1
                    ? `Ramp segment ${segIdx + 1} of ${segments.length}${rangeLabel ? ` (${rangeLabel})` : ''}`
                    : undefined
                }
                className="space-y-6"
              >
                {segments.length > 1 ? (
                  <p className="text-nano font-medium tracking-wider text-muted uppercase">
                    Ramp {segIdx + 1}/{segments.length} · indices {rangeLabel}
                  </p>
                ) : null}
                <div
                  className="grid w-full min-w-0 gap-x-0 gap-y-px"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {segment.map((s) => (
                    <div
                      key={`${s.index}-sw`}
                      className="flex min-w-0 flex-col items-stretch font-mono"
                      title={`${s.label} · idx ${s.index} · display ${getDisplayIdx(s.index)}`}
                    >
                      <span className="shrink-0 px-2 py-4 text-center text-nano leading-none text-default">
                        {getDisplayIdx(s.index)}
                      </span>
                      <div
                        role="img"
                        aria-label={`Color swatch: ${s.label}, idx ${s.index}`}
                        className="h-32 w-full shrink-0 sm:h-36 nsb-lg:h-40"
                        style={{backgroundColor: s.serialized.hex}}
                      />
                    </div>
                  ))}
                  <RampSemanticLaneGridRows
                    segment={segment}
                    lanesByColumn={perColumnLanes}
                    alphaBaseLogicalIndex={alphaBaseIndex}
                    keyPrefix={`${groupId}-cell`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
GlobalScaleStrip.displayName = 'GlobalScaleStrip'

