import {serializeColor} from '@/lib/neutral-engine/serialize'
import {
  altRoleForIndex,
  borderRoleForIndex,
  emphasisBorderRole,
  emphasisSurfaceRole,
  emphasisTextRole,
  INVERSE_MODIFIER_INDEX,
  surfaceRoleForIndex,
  SURFACE_SLOTS,
  TEXT_SLOTS,
  textRoleForIndex,
} from '@/lib/neutral-engine/semanticNaming'
import type {
  GlobalSwatch,
  SystemMappingConfig,
  SystemRole,
  SystemToken,
  ThemeMode,
} from '@/lib/neutral-engine/types'

function clampIntToRange(v: number, lo: number, hi: number): number {
  const r = Math.round(v)
  if (!Number.isFinite(r)) return lo
  return Math.max(lo, Math.min(hi, r))
}

function clampStepInterval(v: number): number {
  const r = Math.round(v)
  if (!Number.isFinite(r)) return 1
  return Math.max(1, Math.min(32, r))
}

/**
 * Pins ladder-bound fields when the global step count changes so starts and dark segment length
 * stay within [0, n−1] / [3, n] — same bounds as the builder UI and {@link deriveSystemTokens}.
 */
export function clampSystemMappingToLadderLength(
  n: number,
  cfg: SystemMappingConfig,
): SystemMappingConfig {
  const ladderN = Math.max(2, Math.floor(n))
  const maxStart = ladderN - 1
  const next: SystemMappingConfig = {
    ...cfg,
    fillStart: clampIntToRange(cfg.fillStart, 0, maxStart),
    strokeStart: clampIntToRange(cfg.strokeStart, 0, maxStart),
    textStart: clampIntToRange(cfg.textStart, 0, maxStart),
    darkFillStart: clampIntToRange(cfg.darkFillStart, 0, maxStart),
    darkStrokeStart: clampIntToRange(cfg.darkStrokeStart, 0, maxStart),
    darkTextStart: clampIntToRange(cfg.darkTextStart, 0, maxStart),
    darkSegmentLength: clampIntToRange(cfg.darkSegmentLength, 3, ladderN),
    lightFillStepInterval: clampStepInterval(cfg.lightFillStepInterval),
    lightStrokeStepInterval: clampStepInterval(cfg.lightStrokeStepInterval),
    lightTextStepInterval: clampStepInterval(cfg.lightTextStepInterval),
    darkFillStepInterval: clampStepInterval(cfg.darkFillStepInterval),
    darkStrokeStepInterval: clampStepInterval(cfg.darkStrokeStepInterval),
    darkTextStepInterval: clampStepInterval(cfg.darkTextStepInterval),
  }
  if (
    next.fillStart === cfg.fillStart &&
    next.strokeStart === cfg.strokeStart &&
    next.textStart === cfg.textStart &&
    next.darkFillStart === cfg.darkFillStart &&
    next.darkStrokeStart === cfg.darkStrokeStart &&
    next.darkTextStart === cfg.darkTextStart &&
    next.darkSegmentLength === cfg.darkSegmentLength &&
    next.lightFillStepInterval === cfg.lightFillStepInterval &&
    next.lightStrokeStepInterval === cfg.lightStrokeStepInterval &&
    next.lightTextStepInterval === cfg.lightTextStepInterval &&
    next.darkFillStepInterval === cfg.darkFillStepInterval &&
    next.darkStrokeStepInterval === cfg.darkStrokeStepInterval &&
    next.darkTextStepInterval === cfg.darkTextStepInterval
  ) {
    return cfg
  }
  return next
}

/** Effective index spacing for a role: step interval × contrast distance (same as legacy single step). */
export function effectiveStepFromInterval(interval: number, contrastDistance: number): number {
  const raw = Math.max(1, Math.round(interval * contrastDistance))
  return Math.max(1, raw)
}

function clampIndex(i: number, n: number): number {
  return Math.max(0, Math.min(n - 1, Math.round(i)))
}

/**
 * Full ladder opposite of `globalIndex` (theme-flip counterpart): light end ↔ dark end.
 * Used for `surface-inverse` and `text-neutral-inverse` vs their `default` slots.
 */
export function mirrorRampIndex(globalIndex: number, n: number): number {
  return clampIndex(n - 1 - globalIndex, n)
}

function withInverseMirror(
  indices: number[],
  n: number,
  slotCount: number,
): number[] {
  return indices.map((idx, k) => {
    if (k === INVERSE_MODIFIER_INDEX && k < slotCount) {
      return mirrorRampIndex(indices[0], n)
    }
    return idx
  })
}

export function pickLightIndices(
  start: number,
  count: number,
  step: number,
  n: number,
): number[] {
  const out: number[] = []
  for (let k = 0; k < count; k++) {
    const idx = clampIndex(start + k * step, n)
    out.push(idx)
  }
  return out
}

/** Dark elevated: index N-1 = background (darkest); surfaces use lower indices (lighter). */
export function pickDarkIndices(startOffset: number, count: number, step: number, n: number): number[] {
  const out: number[] = []
  const base = n - 1
  for (let k = 0; k < count; k++) {
    const idx = clampIndex(base - 1 - startOffset * step - k * step, n)
    out.push(idx)
  }
  return out
}

export function pickDarkStrokeTextIndices(
  startOffset: number,
  count: number,
  step: number,
  n: number,
): number[] {
  const out: number[] = []
  const base = n - 1
  for (let k = 0; k < count; k++) {
    const idx = clampIndex(base - 3 - startOffset * step - k * step, n)
    out.push(idx)
  }
  return out
}

/**
 * Raw text picks walk ladder order; roles use `text.primary` … `text.inverse` (dot-path).
 *
 * - **Light:** stronger type = **darker** ink = **higher** global index in the pick run;
 *   `pickLightIndices` is ascending, so we reverse for semantic order.
 * - **Dark elevated:** stronger type = **brighter** = **lower** global index;
 *   `pickDarkStrokeTextIndices` is descending, so we reverse.
 */
export function orderTextIndicesForSemanticRoles(raw: number[]): number[] {
  if (raw.length <= 1) return raw
  return [...raw].reverse()
}

function makeToken(
  id: string,
  name: string,
  role: SystemRole,
  theme: ThemeMode,
  sourceIndex: number,
  swatch: GlobalSwatch,
  alpha?: number,
): SystemToken {
  if (alpha != null && alpha < 1) {
    const c = swatch.color.clone()
    c.alpha = alpha
    return {
      id,
      name,
      role,
      theme,
      sourceGlobalIndex: sourceIndex,
      color: c,
      serialized: serializeColor(c),
      alpha,
    }
  }
  return {
    id,
    name,
    role,
    theme,
    sourceGlobalIndex: sourceIndex,
    color: swatch.color,
    serialized: swatch.serialized,
  }
}

export function deriveSystemTokens(
  global: GlobalSwatch[],
  cfg: SystemMappingConfig,
): SystemToken[] {
  const n = global.length
  if (n < 2) return []
  const theme = cfg.themeMode
  const tokens: SystemToken[] = []

  const isLight = theme === 'light'

  const stepFill = effectiveStepFromInterval(
    isLight ? cfg.lightFillStepInterval : cfg.darkFillStepInterval,
    cfg.contrastDistance,
  )
  const stepStroke = effectiveStepFromInterval(
    isLight ? cfg.lightStrokeStepInterval : cfg.darkStrokeStepInterval,
    cfg.contrastDistance,
  )
  const stepText = effectiveStepFromInterval(
    isLight ? cfg.lightTextStepInterval : cfg.darkTextStepInterval,
    cfg.contrastDistance,
  )

  const fillIndices = isLight
    ? pickLightIndices(cfg.fillStart, cfg.fillCount, stepFill, n)
    : pickDarkIndices(cfg.darkFillStart, cfg.darkFillCount, stepFill, n)

  const strokeIndices = isLight
    ? pickLightIndices(cfg.strokeStart, cfg.strokeCount, stepStroke, n)
    : pickDarkStrokeTextIndices(cfg.darkStrokeStart, cfg.darkStrokeCount, stepStroke, n)

  const textIndicesRaw = isLight
    ? pickLightIndices(cfg.textStart, cfg.textCount, stepText, n)
    : pickDarkStrokeTextIndices(cfg.darkTextStart, cfg.darkTextCount, stepText, n)
  const textOrdered = orderTextIndicesForSemanticRoles(textIndicesRaw)
  const surfaceIndices = withInverseMirror(fillIndices, n, SURFACE_SLOTS.length)
  const textIndices = withInverseMirror(textOrdered, n, TEXT_SLOTS.length)

  surfaceIndices.forEach((idx, k) => {
    const role = surfaceRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })

  strokeIndices.forEach((idx, k) => {
    const role = borderRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })

  textIndices.forEach((idx, k) => {
    const role = textRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })

  const altBase = isLight
    ? clampIndex(Math.floor(n * 0.45), n)
    : clampIndex(n - 4, n)
  for (let k = 0; k < cfg.altCount; k++) {
    const idx = clampIndex(altBase + k, n)
    const role = altRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!, cfg.altAlpha))
  }

  if (cfg.includeContrastGroups) {
    const bumpFill = Math.max(1, Math.round(stepFill * 2))
    const bumpStroke = Math.max(1, Math.round(stepStroke * 2))
    const bumpText = Math.max(1, Math.round(stepText * 2))
    surfaceIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpFill, n)
      const role = emphasisSurfaceRole(k)
      tokens.push(makeToken(role, role, role, theme, hi, global[hi]!))
    })
    strokeIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpStroke, n)
      const role = emphasisBorderRole(k)
      tokens.push(makeToken(role, role, role, theme, hi, global[hi]!))
    })
    textIndices.forEach((idx, k) => {
      const lo = clampIndex(idx - bumpText, n)
      const role = emphasisTextRole(k)
      tokens.push(makeToken(role, role, role, theme, lo, global[lo]!))
    })
  }

  return tokens
}

/** Resolved global indices per role for UI previews (same rules as {@link deriveSystemTokens}). */
export function previewResolvedRoleIndices(
  cfg: SystemMappingConfig,
  n: number,
  theme: 'light' | 'darkElevated',
): {surface: number[]; border: number[]; text: number[]} {
  if (theme === 'light') {
    const sf = effectiveStepFromInterval(cfg.lightFillStepInterval, cfg.contrastDistance)
    const ss = effectiveStepFromInterval(cfg.lightStrokeStepInterval, cfg.contrastDistance)
    const st = effectiveStepFromInterval(cfg.lightTextStepInterval, cfg.contrastDistance)
    const surfaceRaw = pickLightIndices(cfg.fillStart, cfg.fillCount, sf, n)
    const textRaw = pickLightIndices(cfg.textStart, cfg.textCount, st, n)
    return {
      surface: withInverseMirror(surfaceRaw, n, SURFACE_SLOTS.length),
      border: pickLightIndices(cfg.strokeStart, cfg.strokeCount, ss, n),
      text: withInverseMirror(orderTextIndicesForSemanticRoles(textRaw), n, TEXT_SLOTS.length),
    }
  }
  const df = effectiveStepFromInterval(cfg.darkFillStepInterval, cfg.contrastDistance)
  const ds = effectiveStepFromInterval(cfg.darkStrokeStepInterval, cfg.contrastDistance)
  const dt = effectiveStepFromInterval(cfg.darkTextStepInterval, cfg.contrastDistance)
  const surfaceRaw = pickDarkIndices(cfg.darkFillStart, cfg.darkFillCount, df, n)
  const textRaw = pickDarkStrokeTextIndices(cfg.darkTextStart, cfg.darkTextCount, dt, n)
  return {
    surface: withInverseMirror(surfaceRaw, n, SURFACE_SLOTS.length),
    border: pickDarkStrokeTextIndices(cfg.darkStrokeStart, cfg.darkStrokeCount, ds, n),
    text: withInverseMirror(orderTextIndicesForSemanticRoles(textRaw), n, TEXT_SLOTS.length),
  }
}

/** Tokens for both light and dark for export / comparison. */
export function deriveAllThemeTokens(
  global: GlobalSwatch[],
  base: SystemMappingConfig,
): {light: SystemToken[]; dark: SystemToken[]} {
  const light = deriveSystemTokens(global, {...base, themeMode: 'light'})
  const dark = deriveSystemTokens(global, {...base, themeMode: 'darkElevated'})
  return {light, dark}
}
