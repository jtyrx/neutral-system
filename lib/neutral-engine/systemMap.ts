import {serializeColor} from '@/lib/neutral-engine/serialize'
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
 * Raw text picks walk ladder order, but token ids `text-0` … `text-(n-1)` are semantic:
 * strongest (display / emphasis) → weakest (faint).
 *
 * - **Light:** on light surfaces, stronger type = **darker** ink = **higher** global index among
 *   the pick run. `pickLightIndices` returns ascending indices (lighter → darker), so we reverse.
 * - **Dark elevated:** on dark surfaces, stronger type = **brighter** = **lower** global index among
 *   the pick run. `pickDarkStrokeTextIndices` returns descending indices, so we reverse.
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
  const textIndices = orderTextIndicesForSemanticRoles(textIndicesRaw)

  fillIndices.forEach((idx, k) => {
    tokens.push(
      makeToken(
        `fill-${k}`,
        `fill-${k}`,
        'fill',
        theme,
        idx,
        global[idx]!,
      ),
    )
  })

  strokeIndices.forEach((idx, k) => {
    tokens.push(
      makeToken(
        `stroke-${k}`,
        `stroke-${k}`,
        'stroke',
        theme,
        idx,
        global[idx]!,
      ),
    )
  })

  textIndices.forEach((idx, k) => {
    tokens.push(
      makeToken(
        `text-${k}`,
        `text-${k}`,
        'text',
        theme,
        idx,
        global[idx]!,
      ),
    )
  })

  const altBase = isLight
    ? clampIndex(Math.floor(n * 0.45), n)
    : clampIndex(n - 4, n)
  for (let k = 0; k < cfg.altCount; k++) {
    const idx = clampIndex(altBase + k, n)
    tokens.push(
      makeToken(
        `alt-${k}`,
        `alt-${k}`,
        'alt',
        theme,
        idx,
        global[idx]!,
        cfg.altAlpha,
      ),
    )
  }

  if (cfg.includeContrastGroups) {
    const bumpFill = Math.max(1, Math.round(stepFill * 2))
    const bumpStroke = Math.max(1, Math.round(stepStroke * 2))
    const bumpText = Math.max(1, Math.round(stepText * 2))
    fillIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpFill, n)
      tokens.push(
        makeToken(
          `contrast-fill-${k}`,
          `contrast-fill-${k}`,
          'contrastFill',
          theme,
          hi,
          global[hi]!,
        ),
      )
    })
    strokeIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bumpStroke, n)
      tokens.push(
        makeToken(
          `contrast-stroke-${k}`,
          `contrast-stroke-${k}`,
          'contrastStroke',
          theme,
          hi,
          global[hi]!,
        ),
      )
    })
    textIndices.forEach((idx, k) => {
      const lo = clampIndex(idx - bumpText, n)
      tokens.push(
        makeToken(
          `contrast-text-${k}`,
          `contrast-text-${k}`,
          'contrastText',
          theme,
          lo,
          global[lo]!,
        ),
      )
    })
  }

  return tokens
}

/** Resolved global indices per role for UI previews (same rules as {@link deriveSystemTokens}). */
export function previewResolvedRoleIndices(
  cfg: SystemMappingConfig,
  n: number,
  theme: 'light' | 'darkElevated',
): {fill: number[]; stroke: number[]; text: number[]} {
  if (theme === 'light') {
    const sf = effectiveStepFromInterval(cfg.lightFillStepInterval, cfg.contrastDistance)
    const ss = effectiveStepFromInterval(cfg.lightStrokeStepInterval, cfg.contrastDistance)
    const st = effectiveStepFromInterval(cfg.lightTextStepInterval, cfg.contrastDistance)
    return {
      fill: pickLightIndices(cfg.fillStart, cfg.fillCount, sf, n),
      stroke: pickLightIndices(cfg.strokeStart, cfg.strokeCount, ss, n),
      text: orderTextIndicesForSemanticRoles(
        pickLightIndices(cfg.textStart, cfg.textCount, st, n),
      ),
    }
  }
  const df = effectiveStepFromInterval(cfg.darkFillStepInterval, cfg.contrastDistance)
  const ds = effectiveStepFromInterval(cfg.darkStrokeStepInterval, cfg.contrastDistance)
  const dt = effectiveStepFromInterval(cfg.darkTextStepInterval, cfg.contrastDistance)
  return {
    fill: pickDarkIndices(cfg.darkFillStart, cfg.darkFillCount, df, n),
    stroke: pickDarkStrokeTextIndices(cfg.darkStrokeStart, cfg.darkStrokeCount, ds, n),
    text: orderTextIndicesForSemanticRoles(
      pickDarkStrokeTextIndices(cfg.darkTextStart, cfg.darkTextCount, dt, n),
    ),
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
