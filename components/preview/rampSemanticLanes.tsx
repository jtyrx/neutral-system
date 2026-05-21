import {Fragment} from 'react'

import {cn} from '@/lib/cn'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine'
import {
  LaneBadges,
  type SemanticLanesBuckets,
} from '@/components/preview/laneBadges'


const LANE_CELL_MIN_H = 'min-h-[1rem]'

export type RampSemanticLaneRowsProps = {
  segment: GlobalSwatch[]
  lanesByColumn: SemanticLanesBuckets[]
  alphaBaseLogicalIndex?: number | null | undefined
  keyPrefix?: string | undefined
}

/**
 * Grid cells for rows 2–5 only (surface, border, text, alpha) — parent supplies
 * grid container with matching `gridTemplateColumns` and optionally row 1 swatches.
 */
export function RampSemanticLaneGridRows({
  segment,
  lanesByColumn,
  alphaBaseLogicalIndex,
  keyPrefix = 'lane',
}: RampSemanticLaneRowsProps) {
  return (
    <Fragment>
      {segment.map((s, ci) => {
        const lanes = lanesByColumn[ci]
        const surfaceMerged = lanes
          ? [...lanes.surface, ...lanes.other]
          : ([] as SystemToken[])
        return (
          <div
            key={`${keyPrefix}-${s.index}-surf`}
            aria-label={`Index ${s.index}: surface mappings`}
            className={cn(
              'flex min-w-0 flex-col items-center justify-start border-hairline/50 pt-2',
              LANE_CELL_MIN_H,
            )}
          >
            <LaneBadges tokens={surfaceMerged} />
          </div>
        )
      })}
      {segment.map((s, ci) => (
        <div
          key={`${keyPrefix}-${s.index}-bdr`}
          aria-label={`Index ${s.index}: border mappings`}
          className={cn(
            'flex min-w-0 flex-col items-center justify-start pt-px',
            LANE_CELL_MIN_H,
          )}
        >
          <LaneBadges tokens={lanesByColumn[ci]?.border ?? []} />
        </div>
      ))}
      {segment.map((s, ci) => (
        <div
          key={`${keyPrefix}-${s.index}-txt`}
          aria-label={`Index ${s.index}: text mappings`}
          className={cn(
            'flex min-w-0 flex-col items-center justify-start pt-px',
            LANE_CELL_MIN_H,
          )}
        >
          <LaneBadges tokens={lanesByColumn[ci]?.text ?? []} />
        </div>
      ))}
      {segment.map((s) => {
        const showAlpha =
          alphaBaseLogicalIndex != null && s.index === alphaBaseLogicalIndex
        return (
          <div
            key={`${keyPrefix}-${s.index}-alp`}
            aria-label={
              showAlpha
                ? `Index ${s.index}: alpha neutral token base`
                : `Index ${s.index}: no alpha anchor`
            }
            className={cn(
              'flex min-w-0 flex-col items-center justify-start pt-px',
              LANE_CELL_MIN_H,
            )}
          >
            {showAlpha ? (
              <span
                className="inline-flex min-w-[1.05rem] justify-center rounded bg-(--badge-violet-fill) px-2 py-px text-nano leading-none font-semibold text-(--badge-violet-on)"
                title="Alpha neutral token base"
              >
                Aα
              </span>
            ) : (
              <span className="text-nano leading-none text-disabled">
                —
              </span>
            )}
          </div>
        )
      })}
    </Fragment>
  )
}
RampSemanticLaneGridRows.displayName = 'RampSemanticLaneGridRows'

export type RampSemanticLanesGridProps = RampSemanticLaneRowsProps & {
  className?: string
}

/** Standalone grid for dock use under fused ramp rail (-rows 2–5). */
export function RampSemanticLanesGrid({
  segment,
  lanesByColumn,
  alphaBaseLogicalIndex,
  keyPrefix,
  className,
}: RampSemanticLanesGridProps) {
  const cols = segment.length <= 0 ? 1 : segment.length
  return (
    <div
      data-slot="ramp-semantic-lanes-grid"
      className={cn(
        'grid w-full min-w-0 gap-x-0 gap-y-px rounded-b-card border-x border-b border-hairline/60 bg-raised px-px pb-px',
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      <RampSemanticLaneGridRows
        segment={segment}
        lanesByColumn={lanesByColumn}
        alphaBaseLogicalIndex={alphaBaseLogicalIndex}
        keyPrefix={keyPrefix}
      />
    </div>
  )
}
RampSemanticLanesGrid.displayName = 'RampSemanticLanesGrid'
