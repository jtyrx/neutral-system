'use client'

import {Fragment, memo} from 'react'

import {cn} from '@/lib/utils'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine'
import {
  BORDER_SLOTS,
  compareSemanticRoles,
  semanticCategory,
  SURFACE_ROLE_SORT_ORDER,
  TEXT_SLOTS,
} from '@/lib/neutral-engine/semanticNaming'

const BORDER_ROLE_ORDER = BORDER_SLOTS.map((s) => `border.${s}` as const)
const TEXT_ROLE_ORDER = TEXT_SLOTS.map((s) => `text.${s}` as const)

export type SemanticLanesBuckets = {
  surface: SystemToken[]
  border: SystemToken[]
  text: SystemToken[]
  /** Emphasis / interactive — surfaced in Surface lane merged with pure surface roles. */
  other: SystemToken[]
}

/**
 * Ladder-ordered S#/B#/T# badges; interactive/emphasis use a neutral dot.
 * Badge colors (emerald, amber, sky) are fixed design constants for this preview visualization —
 * intentionally not tokenized since they serve as categorical color codes, not UI surface tokens.
 */
export function stripRoleBadge(role: string): {
  text: string
  className: string
} {
  const cat = semanticCategory(role)
  if (cat === 'surface') {
    const i = SURFACE_ROLE_SORT_ORDER.indexOf(role)
    if (i >= 0)
      return {text: `S${i + 1}`, className: 'bg-emerald-400/90 text-zinc-950'}
    const m = /^surface\.layer-(\d+)$/.exec(role)
    if (m)
      return {
        text: `S${Number(m[1]) + 1}`,
        className: 'bg-emerald-400/90 text-zinc-950',
      }
    return {text: 'S?', className: 'bg-emerald-400/90 text-zinc-950'}
  }
  if (cat === 'border') {
    const amberBadge = 'bg-(--chrome-amber-fill-strong) text-zinc-950'
    const i = BORDER_ROLE_ORDER.findIndex((r) => r === role)
    if (i >= 0) return {text: `B${i + 1}`, className: amberBadge}
    const m = role.match(/^border\.layer-(\d+)$/)
    if (m) return {text: `B${Number(m[1]) + 1}`, className: amberBadge}
    return {text: 'B?', className: amberBadge}
  }
  if (cat === 'text') {
    const skyBadge = 'bg-(--chrome-sky-fill-strong) text-default'
    const i = TEXT_ROLE_ORDER.findIndex((r) => r === role)
    if (i >= 0) return {text: `T${i + 1}`, className: skyBadge}
    const m = role.match(/^text\.layer-(\d+)$/)
    if (m) return {text: `T${Number(m[1]) + 1}`, className: skyBadge}
    return {text: 'T?', className: skyBadge}
  }
  return {
    text: '·',
    className: 'bg-(--chrome-overlay-strong) text-default ring-1 ring-white/15',
  }
}

export function sortMappedForStrip(tokens: SystemToken[]): SystemToken[] {
  return [...tokens].sort((a, b) => compareSemanticRoles(a.role, b.role))
}

export function tokensForSemanticLanes(
  mapped: SystemToken[],
): SemanticLanesBuckets {
  const surface: SystemToken[] = []
  const border: SystemToken[] = []
  const text: SystemToken[] = []
  const other: SystemToken[] = []
  for (const t of mapped) {
    const c = semanticCategory(t.role)
    if (c === 'surface') surface.push(t)
    else if (c === 'border') border.push(t)
    else if (c === 'text') text.push(t)
    else other.push(t)
  }
  return {
    surface: sortMappedForStrip(surface),
    border: sortMappedForStrip(border),
    text: sortMappedForStrip(text),
    other: sortMappedForStrip(other),
  }
}

/** Compact lane height — badge color (S/B/T/·/Aα) identifies role without row labels. */
const LANE_CELL_MIN_H = 'min-h-[1rem]'
const BADGE_GAP = 'flex flex-wrap content-start gap-2 justify-center'

export function LaneBadges({tokens}: {tokens: SystemToken[]}) {
  if (tokens.length === 0) {
    return <span className="text-[0.55rem] text-disabled">—</span>
  }
  return (
    <div className={cn(BADGE_GAP, 'px-px py-2')}>
      {tokens.map((t) => {
        const badge = stripRoleBadge(t.role)
        return (
          <span
            key={t.id}
            className={cn(
              'inline-flex max-w-full min-w-[1.05rem] justify-center rounded px-2 py-2 text-[0.58rem] text-trim-both leading-none font-semibold',
              badge.className,
            )}
            title={`${t.name} (${t.role})`}
          >
            {badge.text}
          </span>
        )
      })}
    </div>
  )
}

export type RampSemanticLaneRowsProps = {
  segment: GlobalSwatch[]
  lanesByColumn: SemanticLanesBuckets[]
  alphaBaseLogicalIndex?: number | null
  keyPrefix?: string
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
                className="inline-flex min-w-[1.05rem] justify-center rounded bg-violet-400/90 px-2 py-px text-[0.58rem] leading-none font-semibold text-zinc-950"
                title="Alpha neutral token base"
              >
                Aα
              </span>
            ) : (
              <span className="text-[0.52rem] leading-none text-disabled">
                —
              </span>
            )}
          </div>
        )
      })}
    </Fragment>
  )
}

export type RampSemanticLanesGridProps = RampSemanticLaneRowsProps & {
  className?: string
}

/** Standalone grid for dock use under fused ramp rail (-rows 2–5). */
function RampSemanticLanesGridInner({
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

export const RampSemanticLanesGrid = memo(RampSemanticLanesGridInner)
