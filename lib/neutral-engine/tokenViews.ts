import type {SystemRole, SystemToken} from '@/lib/neutral-engine/types'

/** Same ordering as preview role tables — single source for sort + grouping. */
export const ROLE_DISPLAY_ORDER: SystemRole[] = [
  'fill',
  'stroke',
  'text',
  'alt',
  'contrastFill',
  'contrastStroke',
  'contrastText',
  'contrastAlt',
]

function roleRank(role: SystemRole): number {
  const i = ROLE_DISPLAY_ORDER.indexOf(role)
  return i === -1 ? 999 : i
}

/**
 * Precomputed indexes for preview UIs: one pass over tokens replaces repeated filter/sort/map work.
 */
export type TokenView = {
  /** Semantic role → tokens (only roles that appear). */
  byRole: Map<SystemRole, SystemToken[]>
  /** Global ramp index → tokens referencing that swatch (GlobalScaleStrip). */
  byGlobalIndex: Map<number, SystemToken[]>
  /** Sorted for semantic role tables (role order, then name). */
  sortedForTable: SystemToken[]
}

export function buildTokenView(tokens: SystemToken[]): TokenView {
  const byRole = new Map<SystemRole, SystemToken[]>()
  const byGlobalIndex = new Map<number, SystemToken[]>()

  for (const t of tokens) {
    const roleList = byRole.get(t.role) ?? []
    roleList.push(t)
    byRole.set(t.role, roleList)

    const idxList = byGlobalIndex.get(t.sourceGlobalIndex) ?? []
    idxList.push(t)
    byGlobalIndex.set(t.sourceGlobalIndex, idxList)
  }

  const sortedForTable = [...tokens].sort((a, b) => {
    const rd = roleRank(a.role) - roleRank(b.role)
    if (rd !== 0) return rd
    return a.name.localeCompare(b.name)
  })

  return {byRole, byGlobalIndex, sortedForTable}
}

/**
 * Global ramp indices referenced by any derived system token (Light + Dark), including contrast
 * groups — same source as preview tables and exports.
 */
export function usedGlobalIndicesFromTokenViews(light: TokenView, dark: TokenView): Set<number> {
  const s = new Set<number>()
  for (const idx of light.byGlobalIndex.keys()) {
    s.add(idx)
  }
  for (const idx of dark.byGlobalIndex.keys()) {
    s.add(idx)
  }
  return s
}
