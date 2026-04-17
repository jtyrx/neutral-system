import {serializeColor} from '@/lib/neutral-engine/serialize'
import type {
  GlobalSwatch,
  SystemMappingConfig,
  SystemRole,
  SystemToken,
  ThemeMode,
} from '@/lib/neutral-engine/types'

export function effectiveMappingStep(cfg: SystemMappingConfig): number {
  const raw = Math.max(1, Math.round(cfg.stepInterval * cfg.contrastDistance))
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
  const step = effectiveMappingStep(cfg)
  const theme = cfg.themeMode
  const tokens: SystemToken[] = []

  const isLight = theme === 'light'

  const fillIndices = isLight
    ? pickLightIndices(cfg.fillStart, cfg.fillCount, step, n)
    : pickDarkIndices(cfg.fillStart, cfg.fillCount, step, n)

  const strokeIndices = isLight
    ? pickLightIndices(cfg.strokeStart, cfg.strokeCount, step, n)
    : pickDarkStrokeTextIndices(cfg.strokeStart, cfg.strokeCount, step, n)

  const textIndices = isLight
    ? pickLightIndices(cfg.textStart, cfg.textCount, step, n)
    : pickDarkStrokeTextIndices(cfg.textStart + 2, cfg.textCount, step, n)

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
    const bump = Math.max(1, Math.round(step * 2))
    fillIndices.forEach((idx, k) => {
      const hi = clampIndex(idx + bump, n)
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
      const hi = clampIndex(idx + bump, n)
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
      const lo = clampIndex(idx - bump, n)
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
  const step = effectiveMappingStep(cfg)
  if (theme === 'light') {
    return {
      fill: pickLightIndices(cfg.fillStart, cfg.fillCount, step, n),
      stroke: pickLightIndices(cfg.strokeStart, cfg.strokeCount, step, n),
      text: pickLightIndices(cfg.textStart, cfg.textCount, step, n),
    }
  }
  return {
    fill: pickDarkIndices(cfg.fillStart, cfg.fillCount, step, n),
    stroke: pickDarkStrokeTextIndices(cfg.strokeStart, cfg.strokeCount, step, n),
    text: pickDarkStrokeTextIndices(cfg.textStart + 2, cfg.textCount, step, n),
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
