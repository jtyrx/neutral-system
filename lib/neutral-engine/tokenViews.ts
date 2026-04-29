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
  /** Layer → tokens (pre-sorted) for previews/sections to avoid repeated filter/sort work. */
  byLayer: Record<SemanticLayer, SystemToken[]>
  /** Same as {@link byLayer} but excludes overflow `*.layer-*` roles. */
  byLayerPublic: Record<SemanticLayer, SystemToken[]>
  /** Public surface/text layers without inverse flip roles (use with inverse-pair category). */
  byLayerPublicNonInverse: Record<'surface' | 'text', SystemToken[]>
  /** Inverse surface + text-on-inverse for paired-role “Inverse” category. */
  inversePairCategory: SystemToken[]
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

  const byLayer: Record<SemanticLayer, SystemToken[]> = {
    surface: [],
    border: [],
    text: [],
    interactive: [],
    emphasis: [],
  }

  for (const t of tokens) {
    if (t.role.startsWith('surface.')) byLayer.surface.push(t)
    else if (t.role.startsWith('border.')) byLayer.border.push(t)
    else if (t.role.startsWith('text.')) byLayer.text.push(t)
    else if (t.role.startsWith('emphasis.')) byLayer.emphasis.push(t)
    else if (t.role.startsWith('state.') || t.role.startsWith('overlay.')) byLayer.interactive.push(t)
  }

  const sortRole = (a: SystemToken, b: SystemToken) =>
    compareSemanticRoles(a.role, b.role) || a.name.localeCompare(b.name)

  ;(Object.keys(byLayer) as SemanticLayer[]).forEach((k) => {
    byLayer[k] = byLayer[k].sort(sortRole)
  })

  const byLayerPublic: Record<SemanticLayer, SystemToken[]> = {
    surface: byLayer.surface.filter((t) => !isOverflowRole(t.role)),
    border: byLayer.border.filter((t) => !isOverflowRole(t.role)),
    text: byLayer.text.filter((t) => !isOverflowRole(t.role)),
    interactive: byLayer.interactive.filter((t) => !isOverflowRole(t.role)),
    emphasis: byLayer.emphasis.filter((t) => !isOverflowRole(t.role)),
  }

  const byLayerPublicNonInverse: Record<'surface' | 'text', SystemToken[]> = {
    surface: byLayerPublic.surface.filter((t) => !isInversePairRole(t.role)),
    text: byLayerPublic.text.filter((t) => !isInversePairRole(t.role)),
  }

  const inversePairCategory: SystemToken[] = []
  for (const role of INVERSE_PAIR_ROLES) {
    const list = byRole.get(role)
    if (list) inversePairCategory.push(...list.filter((t) => !isOverflowRole(t.role)))
  }
  inversePairCategory.sort(sortRole)

  const view: TokenView = {
    byRole,
    byGlobalIndex,
    sortedForTable,
    byLayer,
    byLayerPublic,
    byLayerPublicNonInverse,
    inversePairCategory,
  }
  return view
}

export type SemanticLayer = 'surface' | 'border' | 'text' | 'interactive' | 'emphasis'

/** Tokens for a UI layer (surface / border / text / interactive / emphasis). */
export function tokensForSemanticLayer(view: TokenView, layer: SemanticLayer): SystemToken[] {
  return view.byLayer[layer] ?? []
}

/** Public role tokens only (excludes `*.layer-*` overflow). */
export function tokensForSemanticLayerPublic(view: TokenView, layer: SemanticLayer): SystemToken[] {
  return view.byLayerPublic[layer] ?? []
}

/**
 * Surface / text layers without contrast-flip inverse slots — use with {@link tokensForInversePairCategory}.
 */
export function tokensForSemanticLayerPublicNonInverse(view: TokenView, layer: SemanticLayer): SystemToken[] {
  if (layer === 'surface' || layer === 'text') {
    return view.byLayerPublicNonInverse[layer] ?? []
  }
  return tokensForSemanticLayerPublic(view, layer)
}

const INVERSE_PAIR_ROLES = ['surface.inverse', 'text.on'] as const satisfies readonly SystemRole[]

/** Inverse surface + text-on-inverse for paired-role “Inverse” category. */
export function tokensForInversePairCategory(view: TokenView): SystemToken[] {
  if (view.inversePairCategory) return view.inversePairCategory
  const out: SystemToken[] = []
  for (const role of INVERSE_PAIR_ROLES) {
    const list = view.byRole.get(role)
    if (list) out.push(...list.filter((t) => !isOverflowRole(t.role)))
  }
  return out.sort((a, b) => compareSemanticRoles(a.role, b.role) || a.name.localeCompare(b.name))
}

/** Global ramp indices referenced by any token in a single {@link TokenView}. */
export function usedGlobalIndicesFromTokenView(view: TokenView): Set<number> {
  return new Set(view.byGlobalIndex.keys())
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
