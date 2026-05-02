'use client'

import {memo} from 'react'

import {cn} from '@/lib/utils'
import type {GlobalSwatch, SystemToken, TokenView} from '@/lib/neutral-engine'
import {
  BORDER_SLOTS,
  compareSemanticRoles,
  semanticCategory,
  SURFACE_ROLE_SORT_ORDER,
  TEXT_SLOTS,
} from '@/lib/neutral-engine/semanticNaming'

type Props = {
  global: GlobalSwatch[]
  tokenView: TokenView
  /** Shown above the strip (e.g. “Light · global ramp”). */
  caption: string
  /** Accent for focus ring / column chrome. */
  accentClassName?: string
  /**
   * When true, render swatches in reverse index order (presentation only; indices and token lookups unchanged).
   * Used for dark-theme ramps so the visual reads dark→light alongside light-theme light→dark.
   */
  invertDisplay?: boolean
  /** Global index of the alpha base swatch — renders a violet “Aα” badge when set. */
  alphaBaseIndex?: number
}

/** When `true`, split the ramp into two balanced horizontal segments (~half width each) for long ladders. */
function shouldWrapScaleRows(length: number): boolean {
  return length > 24
}

/** Display order preserves absolute `swatch.index`; order only changes visual traversal. */
function displayOrderedSwatches(
  global: GlobalSwatch[],
  invertDisplay: boolean,
): GlobalSwatch[] {
  const list = invertDisplay ? [...global].reverse() : [...global]
  return list
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

const BORDER_ROLE_ORDER = BORDER_SLOTS.map((s) => `border.${s}` as const)
const TEXT_ROLE_ORDER = TEXT_SLOTS.map((s) => `text.${s}` as const)

/** Ladder-ordered S#/B#/T# badges; interactive/emphasis use a neutral dot. */
function stripRoleBadge(role: string): {text: string; className: string} {
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

function sortMappedForStrip(tokens: SystemToken[]): SystemToken[] {
  return [...tokens].sort((a, b) => compareSemanticRoles(a.role, b.role))
}

function tokensForSemanticLanes(mapped: SystemToken[]): {
  surface: SystemToken[]
  border: SystemToken[]
  text: SystemToken[]
  /** Emphasis / interactive — same badge (·) visuals as before; surfaced in Surface lane after pure surface roles. */
  other: SystemToken[]
} {
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
const BADGE_GAP = 'flex flex-wrap content-start gap-0.5 justify-center'

function LaneBadges({tokens}: {tokens: SystemToken[]}) {
  if (tokens.length === 0) {
    return <span className="text-[0.55rem] text-disabled">—</span>
  }
  return (
    <div className={cn(BADGE_GAP, 'px-px py-0.5')}>
      {tokens.map((t) => {
        const badge = stripRoleBadge(t.role)
        return (
          <span
            key={t.id}
            className={cn(
              'inline-flex max-w-full min-w-[1.05rem] justify-center rounded px-0.5 py-0.5 text-[0.58rem] leading-none font-semibold',
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

/** Full global ramp: one shared grid per segment — swatch row, then surface / border / text / alpha rows (no visible lane labels; badges encode role). Long ladders wrap into two balanced segments. */
function GlobalScaleStripInner({
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
      <div className="rounded-xl border border-dashed border-hairline-strong p-4 text-center text-xs text-muted">
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

  // When the display is inverted (dark ramp), the visual position maps to the reversed export index.
  const getDisplayIdx = (swatchIndex: number) =>
    invertDisplay ? len - 1 - swatchIndex : swatchIndex

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-medium tracking-wide text-muted">
        {caption}
      </p>
      <div
        id={stripId}
        role="group"
        aria-label="Global ramp: color ramp and semantic lanes (surface, border, text, alpha)"
        className={cn(
          'w-full overflow-x-auto rounded-xl border border-hairline bg-raised p-2',
          accentClassName,
        )}
      >
        <div className="flex min-w-0 flex-col gap-3">
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
                className="space-y-1.5"
              >
                {segments.length > 1 ? (
                  <p className="text-[0.55rem] font-medium tracking-wider text-muted uppercase">
                    Ramp {segIdx + 1}/{segments.length} · indices {rangeLabel}
                  </p>
                ) : null}
                {/*
                  Single shared grid: 5 implicit rows × `cols` columns (auto-placement row-major).
                  Order: swatches → surface (+ emphasis/interactive ·) → border → text → alpha.
                  No visible lane labels — S/B/T/· and Aα convey role via color and abbreviation.
                */}
                <div
                  className="grid w-full min-w-0 gap-x-0 gap-y-px"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Row 1: swatches + index */}
                  {segment.map((s) => (
                    <div
                      key={`${s.index}-sw`}
                      className="flex min-w-0 flex-col items-stretch font-mono"
                      title={`${s.label} · idx ${s.index} · display ${getDisplayIdx(s.index)}`}
                    >
                      <span className="shrink-0 px-0.5 py-1 text-center text-[0.5rem] leading-none text-default">
                        {getDisplayIdx(s.index)}
                      </span>
                      <div
                        className="h-8 w-full shrink-0 sm:h-9 nsb-lg:h-10"
                        style={{backgroundColor: s.serialized.hex}}
                      />
                      {/* <span className="shrink-0 px-0.5 py-px text-center text-[0.5rem] leading-none text-disabled">
                        {s.index}
                      </span> */}
                    </div>
                  ))}
                  {/* Row 2: surface */}
                  {segment.map((s, ci) => {
                    const lanes = perColumnLanes[ci]!
                    const surfaceMerged = [...lanes.surface, ...lanes.other]
                    return (
                      <div
                        key={`${s.index}-surf`}
                        aria-label={`Index ${s.index}: surface mappings`}
                        className={cn(
                          'flex min-w-0 flex-col items-center justify-start border-hairline/50 pt-0.5',
                          LANE_CELL_MIN_H,
                        )}
                      >
                        <LaneBadges tokens={surfaceMerged} />
                      </div>
                    )
                  })}
                  {/* Row 3: border */}
                  {segment.map((s, ci) => (
                    <div
                      key={`${s.index}-bdr`}
                      aria-label={`Index ${s.index}: border mappings`}
                      className={cn(
                        'flex min-w-0 flex-col items-center justify-start pt-px',
                        LANE_CELL_MIN_H,
                      )}
                    >
                      <LaneBadges tokens={perColumnLanes[ci]!.border} />
                    </div>
                  ))}
                  {/* Row 4: text */}
                  {segment.map((s, ci) => (
                    <div
                      key={`${s.index}-txt`}
                      aria-label={`Index ${s.index}: text mappings`}
                      className={cn(
                        'flex min-w-0 flex-col items-center justify-start pt-px',
                        LANE_CELL_MIN_H,
                      )}
                    >
                      <LaneBadges tokens={perColumnLanes[ci]!.text} />
                    </div>
                  ))}
                  {/* Row 5: alpha */}
                  {segment.map((s) => {
                    const showAlpha =
                      alphaBaseIndex != null && s.index === alphaBaseIndex
                    return (
                      <div
                        key={`${s.index}-alp`}
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
                            className="inline-flex min-w-[1.05rem] justify-center rounded bg-violet-400/90 px-0.5 py-px text-[0.58rem] leading-none font-semibold text-zinc-950"
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
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const GlobalScaleStrip = memo(GlobalScaleStripInner)
