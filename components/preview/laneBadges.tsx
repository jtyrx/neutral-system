import {cn} from '@/lib/cn'
import type {SystemToken} from '@/lib/neutral-engine'
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
      return {text: `S${i + 1}`, className: 'bg-(--badge-emerald-fill) text-(--badge-emerald-on)'}
    const m = /^surface\.layer-(\d+)$/.exec(role)
    if (m)
      return {
        text: `S${Number(m[1]) + 1}`,
        className: 'bg-(--badge-emerald-fill) text-(--badge-emerald-on)',
      }
    return {text: 'S?', className: 'bg-(--badge-emerald-fill) text-(--badge-emerald-on)'}
  }
  if (cat === 'border') {
    const amberBadge = 'bg-(--chrome-amber-fill-strong) text-default'
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

const BADGE_GAP = 'flex flex-wrap content-start gap-2 justify-center'

export function LaneBadges({tokens}: {tokens: SystemToken[]}) {
  if (tokens.length === 0) {
    return <span className="text-nano text-disabled">—</span>
  }
  return (
    <div className={cn(BADGE_GAP, 'px-px py-2')}>
      {tokens.map((t) => {
        const badge = stripRoleBadge(t.role)
        return (
          <span
            key={t.id}
            className={cn(
              'inline-flex max-w-full min-w-[1.05rem] justify-center rounded px-2 py-2 text-nano text-trim-both leading-none font-semibold',
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
LaneBadges.displayName = 'LaneBadges'
