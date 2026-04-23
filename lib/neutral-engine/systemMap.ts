import {resolveBrandColorForTokens} from '@/lib/neutral-engine/brandColor'
import {parseColorFromSerialized, serializeColor} from '@/lib/neutral-engine/serialize'
import {
  altRoleForIndex,
  borderRoleForIndex,
  BORDER_STANDARD_SLOT_COUNT,
  emphasisBorderRole,
  emphasisSurfaceRole,
  emphasisTextRole,
  SURFACE_STANDARD_COUNT_MAX,
  SURFACE_STANDARD_COUNT_MIN,
  surfaceStandardRoleForIndex,
  TEXT_STANDARD_SLOT_COUNT,
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

/**
 * Dark surface start offset: **−1** is a valid explicit sentinel (see {@link pickDarkIndices});
 * it must not be coerced to 0. Range is [−1, n−1] for ladder length n.
 */
function clampDarkFillStart(v: number, maxStart: number): number {
  const r = Math.round(v)
  if (!Number.isFinite(r)) return 0
  return Math.max(-1, Math.min(maxStart, r))
}

function clampStepInterval(v: number): number {
  const r = Math.round(v)
  if (!Number.isFinite(r)) return 1
  return Math.max(1, Math.min(32, r))
}

/**
 * Pins ladder-bound fields when the global step count changes so starts and dark segment length
 * stay within valid UI/engine bounds. **Exception:** `darkFillStart` may be **−1** (see
 * {@link clampDarkFillStart}); other role starts use [0, n−1]; dark segment length [3, n].
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
    darkFillStart: clampDarkFillStart(cfg.darkFillStart, maxStart),
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
 * Used for `surface.inverse` vs `surface.sunken` and `text.on` vs `text.default`.
 */
export function mirrorRampIndex(globalIndex: number, n: number): number {
  return clampIndex(n - 1 - globalIndex, n)
}

/** Clamp UI “text token count” to standard ladder slots only (inverse is not counted). */
function clampStandardCount(raw: number, max: number): number {
  const r = Math.round(raw)
  if (!Number.isFinite(r)) return 1
  return Math.max(1, Math.min(max, r))
}

/** Clamp surface fill count: {@link SURFACE_STANDARD_COUNT_MIN}…{@link SURFACE_STANDARD_COUNT_MAX}. */
function clampSurfaceStandardCount(raw: number): number {
  const r = Math.round(raw)
  if (!Number.isFinite(r)) return SURFACE_STANDARD_COUNT_MIN
  return Math.max(SURFACE_STANDARD_COUNT_MIN, Math.min(SURFACE_STANDARD_COUNT_MAX, r))
}

/** Clamp border ladder count (default / subtle / strong only; {@link border.focus} is separate). */
function clampBorderStandardCount(raw: number): number {
  const r = Math.round(raw)
  if (!Number.isFinite(r)) return 1
  return Math.max(1, Math.min(BORDER_STANDARD_SLOT_COUNT, r))
}

/** Inverse surface: theme-flip of the first standard surface pick (`surface.sunken` at k=0). */
export function resolveSurfaceInverseIndex(standardSurfaceIndices: number[], n: number): number {
  if (standardSurfaceIndices.length === 0) return clampIndex(0, n)
  return mirrorRampIndex(standardSurfaceIndices[0], n)
}

/** `text.on`: theme-flip of `text.default` (first slot after semantic ordering). */
export function resolveTextInverseIndex(orderedTextIndices: number[], n: number): number {
  if (orderedTextIndices.length === 0) return clampIndex(0, n)
  return mirrorRampIndex(orderedTextIndices[0], n)
}

/**
 * Focus ring token: max-contrast neutral vs page base (`surface.default` = ladder index 1 when present).
 * Independent of border ladder length and step interval.
 */
export function resolveBorderFocusIndex(standardSurfaceIndices: number[], n: number): number {
  if (standardSurfaceIndices.length === 0) return clampIndex(0, n)
  const pageBase = standardSurfaceIndices[1] ?? standardSurfaceIndices[0]!
  return mirrorRampIndex(pageBase, n)
}

/**
 * On-brand marketing / accent surface: one step past `surface.overlay` along the ramp so it reads
 * as a distinct plane from overlay and default (light = deeper; dark elevated = brighter).
 */
export function resolveBrandSurfaceIndex(
  isLight: boolean,
  fillIndices: number[],
  stepFill: number,
  n: number,
): number {
  if (fillIndices.length === 0) return clampIndex(Math.floor(n / 2), n)
  const overlayIdx = fillIndices[fillIndices.length - 1]!
  const delta = Math.max(1, Math.round(stepFill))
  return isLight
    ? clampIndex(overlayIdx + delta, n)
    : clampIndex(overlayIdx - delta, n)
}

/**
 * Fast-path resolver for `surface.brand` without deriving the full system token set.
 * Used for live preview chrome (custom brand) to avoid extra `deriveSystemTokens` work.
 */
export function deriveBrandSurfaceToken(
  global: GlobalSwatch[],
  cfg: SystemMappingConfig,
  theme: 'light' | 'darkElevated',
): SystemToken | null {
  const n = global.length
  if (n < 2) return null
  const isLight = theme === 'light'
  const stepFill = effectiveStepFromInterval(
    isLight ? cfg.lightFillStepInterval : cfg.darkFillStepInterval,
    cfg.contrastDistance,
  )
  const surfaceStandardCount = clampSurfaceStandardCount(isLight ? cfg.fillCount : cfg.darkFillCount)
  const fillIndices = isLight
    ? pickLightIndices(cfg.fillStart, surfaceStandardCount, stepFill, n)
    : pickDarkIndices(cfg.darkFillStart, surfaceStandardCount, stepFill, n)

  const brandIdx = resolveBrandSurfaceIndex(isLight, fillIndices, stepFill, n)
  const sw = global[brandIdx]
  if (!sw) return null

  const brandResolved = resolveBrandColorForTokens(cfg.brandOklch, sw)
  return {
    id: 'surface.brand',
    name: 'surface.brand',
    role: 'surface.brand',
    theme,
    sourceGlobalIndex: brandIdx,
    serialized: brandResolved.serialized,
    ...(brandResolved.customColor ? {customColor: true as const} : {}),
  }
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
 * Raw text picks walk ladder order; roles use `text.default` … `text.disabled` (dot-path); `text.on` is separate.
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
    const c = parseColorFromSerialized(swatch.serialized)
    c.alpha = alpha
    return {
      id,
      name,
      role,
      theme,
      sourceGlobalIndex: sourceIndex,
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

  const surfaceStandardCount = clampSurfaceStandardCount(isLight ? cfg.fillCount : cfg.darkFillCount)
  const textStandardCount = clampStandardCount(
    isLight ? cfg.textCount : cfg.darkTextCount,
    TEXT_STANDARD_SLOT_COUNT,
  )

  const fillIndices = isLight
    ? pickLightIndices(cfg.fillStart, surfaceStandardCount, stepFill, n)
    : pickDarkIndices(cfg.darkFillStart, surfaceStandardCount, stepFill, n)

  const borderStandardCount = clampBorderStandardCount(isLight ? cfg.strokeCount : cfg.darkStrokeCount)
  const strokeIndices = isLight
    ? pickLightIndices(cfg.strokeStart, borderStandardCount, stepStroke, n)
    : pickDarkStrokeTextIndices(cfg.darkStrokeStart, borderStandardCount, stepStroke, n)

  const textIndicesRaw = isLight
    ? pickLightIndices(cfg.textStart, textStandardCount, stepText, n)
    : pickDarkStrokeTextIndices(cfg.darkTextStart, textStandardCount, stepText, n)
  const textOrdered = orderTextIndicesForSemanticRoles(textIndicesRaw)

  const surfaceInverseIdx = resolveSurfaceInverseIndex(fillIndices, n)
  const textOnIdx = resolveTextInverseIndex(textOrdered, n)
  const borderFocusIdx = resolveBorderFocusIndex(fillIndices, n)

  fillIndices.forEach((idx, k) => {
    const role = surfaceStandardRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })
  const brandIdx = resolveBrandSurfaceIndex(isLight, fillIndices, stepFill, n)
  const brandResolved = resolveBrandColorForTokens(cfg.brandOklch, global[brandIdx]!)
  tokens.push({
    id: 'surface.brand',
    name: 'surface.brand',
    role: 'surface.brand',
    theme,
    sourceGlobalIndex: brandIdx,
    serialized: brandResolved.serialized,
    ...(brandResolved.customColor ? {customColor: true as const} : {}),
  })
  tokens.push(
    makeToken(
      'surface.inverse',
      'surface.inverse',
      'surface.inverse',
      theme,
      surfaceInverseIdx,
      global[surfaceInverseIdx]!,
    ),
  )

  strokeIndices.forEach((idx, k) => {
    const role = borderRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })
  tokens.push(
    makeToken(
      'border.focus',
      'border.focus',
      'border.focus',
      theme,
      borderFocusIdx,
      global[borderFocusIdx]!,
    ),
  )

  textOrdered.forEach((idx, k) => {
    const role = textRoleForIndex(k)
    tokens.push(makeToken(role, role, role, theme, idx, global[idx]!))
  })
  tokens.push(
    makeToken(
      'text.on',
      'text.on',
      'text.on',
      theme,
      textOnIdx,
      global[textOnIdx]!,
    ),
  )

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
    fillIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpFill, n)
      const role = emphasisSurfaceRole(k)
      tokens.push(makeToken(role, role, role, theme, hi, global[hi]!))
    })
    strokeIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpStroke, n)
      const role = emphasisBorderRole(k)
      tokens.push(makeToken(role, role, role, theme, hi, global[hi]!))
    })
    textOrdered.forEach((idx, k) => {
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
    const surfaceCount = clampSurfaceStandardCount(cfg.fillCount)
    const borderStdCount = clampBorderStandardCount(cfg.strokeCount)
    const textCount = clampStandardCount(cfg.textCount, TEXT_STANDARD_SLOT_COUNT)
    const surfaceStd = pickLightIndices(cfg.fillStart, surfaceCount, sf, n)
    const textRaw = pickLightIndices(cfg.textStart, textCount, st, n)
    const textOrd = orderTextIndicesForSemanticRoles(textRaw)
    const borderStd = pickLightIndices(cfg.strokeStart, borderStdCount, ss, n)
    const borderFocus = resolveBorderFocusIndex(surfaceStd, n)
    const brandIdx = resolveBrandSurfaceIndex(true, surfaceStd, sf, n)
    return {
      surface: [...surfaceStd, brandIdx, resolveSurfaceInverseIndex(surfaceStd, n)],
      border: [...borderStd, borderFocus],
      text: [...textOrd, resolveTextInverseIndex(textOrd, n)],
    }
  }
  const df = effectiveStepFromInterval(cfg.darkFillStepInterval, cfg.contrastDistance)
  const ds = effectiveStepFromInterval(cfg.darkStrokeStepInterval, cfg.contrastDistance)
  const dt = effectiveStepFromInterval(cfg.darkTextStepInterval, cfg.contrastDistance)
  const surfaceCount = clampSurfaceStandardCount(cfg.darkFillCount)
  const borderStdCount = clampBorderStandardCount(cfg.darkStrokeCount)
  const textCount = clampStandardCount(cfg.darkTextCount, TEXT_STANDARD_SLOT_COUNT)
  const surfaceStd = pickDarkIndices(cfg.darkFillStart, surfaceCount, df, n)
  const textRaw = pickDarkStrokeTextIndices(cfg.darkTextStart, textCount, dt, n)
  const textOrd = orderTextIndicesForSemanticRoles(textRaw)
  const borderStd = pickDarkStrokeTextIndices(cfg.darkStrokeStart, borderStdCount, ds, n)
  const borderFocus = resolveBorderFocusIndex(surfaceStd, n)
  const brandIdx = resolveBrandSurfaceIndex(false, surfaceStd, df, n)
  return {
    surface: [...surfaceStd, brandIdx, resolveSurfaceInverseIndex(surfaceStd, n)],
    border: [...borderStd, borderFocus],
    text: [...textOrd, resolveTextInverseIndex(textOrd, n)],
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
