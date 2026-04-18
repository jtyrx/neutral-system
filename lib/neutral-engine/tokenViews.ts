import {compareSemanticRoles, isInversePairRole, isOverflowRole} from '@/lib/neutral-engine/semanticNaming'
import type {SystemRole, SystemToken} from '@/lib/neutral-engine/types'

/**
 * Precomputed indexes for preview UIs: one pass over tokens replaces repeated filter/sort/map work.
 */
export type TokenView = {
  /** Semantic role → tokens (only roles that appear). */
  byRole: Map<SystemRole, SystemToken[]>
  /** Global ramp index → tokens referencing that swatch (GlobalScaleStrip). */
  byGlobalIndex: Map<number, SystemToken[]>
  /** Sorted for semantic role tables (category order, then name). */
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
    const rd = compareSemanticRoles(a.role, b.role)
    if (rd !== 0) return rd
    return a.name.localeCompare(b.name)
  })

  return {byRole, byGlobalIndex, sortedForTable}
}

export type SemanticLayer = 'surface' | 'border' | 'text' | 'interactive' | 'emphasis'

/** Tokens for a UI layer (surface / border / text / interactive / emphasis). */
export function tokensForSemanticLayer(view: TokenView, layer: SemanticLayer): SystemToken[] {
  const out: SystemToken[] = []
  for (const [role, list] of view.byRole) {
    if (layer === 'emphasis' && role.startsWith('emphasis.')) {
      out.push(...list)
      continue
    }
    if (layer === 'interactive' && (role.startsWith('state.') || role.startsWith('overlay.'))) {
      out.push(...list)
      continue
    }
    if (layer === 'surface' && role.startsWith('surface.')) {
      out.push(...list)
      continue
    }
    if (layer === 'border' && role.startsWith('border.')) {
      out.push(...list)
      continue
    }
    if (layer === 'text' && role.startsWith('text.')) {
      out.push(...list)
    }
  }
  return out.sort((a, b) => compareSemanticRoles(a.role, b.role) || a.name.localeCompare(b.name))
}

/** Public role tokens only (excludes `*.layer-*` overflow). */
export function tokensForSemanticLayerPublic(view: TokenView, layer: SemanticLayer): SystemToken[] {
  return tokensForSemanticLayer(view, layer).filter((t) => !isOverflowRole(t.role))
}

/**
 * Surface / text layers without contrast-flip inverse slots — use with {@link tokensForInversePairCategory}.
 */
export function tokensForSemanticLayerPublicNonInverse(view: TokenView, layer: SemanticLayer): SystemToken[] {
  const toks = tokensForSemanticLayerPublic(view, layer)
  if (layer === 'surface' || layer === 'text') {
    return toks.filter((t) => !isInversePairRole(t.role))
  }
  return toks
}

const INVERSE_PAIR_ROLES = ['surface.inverse', 'text.inverse'] as const satisfies readonly SystemRole[]

/** Inverse surface + text-on-inverse for paired-role “Inverse” category. */
export function tokensForInversePairCategory(view: TokenView): SystemToken[] {
  const out: SystemToken[] = []
  for (const role of INVERSE_PAIR_ROLES) {
    const list = view.byRole.get(role)
    if (list) out.push(...list.filter((t) => !isOverflowRole(t.role)))
  }
  return out.sort((a, b) => compareSemanticRoles(a.role, b.role) || a.name.localeCompare(b.name))
}

/**
 * Global ramp indices referenced by any derived system token (Light + Dark), including emphasis
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
