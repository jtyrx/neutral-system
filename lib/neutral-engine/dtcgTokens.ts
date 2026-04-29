import {createSchema} from 'w3c-design-tokens-standard-schema/zod'
import {z} from 'zod/v4'

import {rampForTheme} from '@/lib/neutral-engine/architectureRamps'
import {oklchCoordsFromSerialized} from '@/lib/neutral-engine/serialize'
import type {
  ArchitectureRamps,
  GlobalSwatch,
  NeutralArchitectureMode,
  SerializedColor,
  SystemToken,
  ThemeMode,
} from '@/lib/neutral-engine/types'

export type DtcgAliasValue = `{${string}}`

export type DtcgOklchComponent = number | 'none'

export type DtcgColorValue = {
  colorSpace: 'oklch'
  components: [number, number, DtcgOklchComponent]
  alpha: number
  hex?: string
}

export type DtcgNeutralSystemExtension = {
  kind: 'primitive' | 'semantic'
  /** Which sibling ramp this primitive belongs to (Advanced Mode). */
  primitiveMode?: 'global' | 'light' | 'dark'
  sourceIndex?: number
  sourceLabel?: string
  sourceReference?: DtcgAliasValue
  role?: string
  theme?: ThemeMode
  customColor?: boolean
  alpha?: number
}

export type DtcgExtensions = {
  'neutral-system'?: DtcgNeutralSystemExtension
}

export type DtcgColorToken = {
  $type: 'color'
  $value: DtcgColorValue | DtcgAliasValue
  $description?: string
  $extensions?: DtcgExtensions
}

export type DtcgGroup = {
  [key: string]: DtcgColorToken | DtcgGroup
}

export type DtcgTokenTree = DtcgGroup

const neutralSystemExtensionSchema = z
  .object({
    kind: z.enum(['primitive', 'semantic']),
    primitiveMode: z.enum(['global', 'light', 'dark']).optional(),
    sourceIndex: z.number().int().nonnegative().optional(),
    sourceLabel: z.string().optional(),
    sourceReference: z.templateLiteral(['{', z.string(), '}']).optional(),
    role: z.string().optional(),
    theme: z.enum(['light', 'darkElevated']).optional(),
    customColor: z.boolean().optional(),
    alpha: z.number().gte(0).lte(1).optional(),
  })
  .passthrough()

const dtcgSchema = createSchema({
  extensionsSchema: z
    .object({
      'neutral-system': neutralSystemExtensionSchema.optional(),
    })
    .passthrough()
    .optional(),
})

function roundComponent(value: number, places = 6): number {
  const factor = 10 ** places
  const rounded = Math.round(value * factor) / factor
  return Object.is(rounded, -0) ? 0 : rounded
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}

function normalizedHue(value: number): DtcgOklchComponent {
  if (!Number.isFinite(value)) return 'none'
  const wrapped = ((value % 360) + 360) % 360
  return roundComponent(wrapped)
}

function sixDigitHex(value: string): string | undefined {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : undefined
}

export function dtcgColorValueFromSerialized(
  serialized: SerializedColor,
  alpha = 1,
): DtcgColorValue {
  const [lightness, chroma, hue] = oklchCoordsFromSerialized(serialized)
  const hex = sixDigitHex(serialized.hex)
  return {
    colorSpace: 'oklch',
    components: [
      roundComponent(clamp(lightness, 0, 1)),
      roundComponent(Math.max(0, Number.isFinite(chroma) ? chroma : 0)),
      normalizedHue(hue),
    ],
    alpha: roundComponent(clamp(alpha, 0, 1)),
    ...(hex ? {hex} : {}),
  }
}

function primitiveAlias(
  label: string,
  architecture: NeutralArchitectureMode,
  theme: ThemeMode,
): DtcgAliasValue {
  if (architecture === 'simple') {
    return `{color.neutral.${label}}`
  }
  return theme === 'light'
    ? `{color.neutral.light.${label}}`
    : `{color.neutral.dark.${label}}`
}

function isDtcgColorToken(node: DtcgColorToken | DtcgGroup): node is DtcgColorToken {
  return '$value' in node
}

function insertToken(root: DtcgTokenTree, path: string[], token: DtcgColorToken): void {
  const tokenKey = path[path.length - 1]
  if (!tokenKey) return

  let cursor = root
  path.slice(0, -1).forEach((segment) => {
    const existing = cursor[segment]
    if (!existing || isDtcgColorToken(existing)) {
      const next: DtcgGroup = {}
      cursor[segment] = next
      cursor = next
      return
    }
    cursor = existing
  })
  cursor[tokenKey] = token
}

function primitiveToken(
  swatch: GlobalSwatch,
  architecture: NeutralArchitectureMode,
  primitiveMode: 'global' | 'light' | 'dark',
): DtcgColorToken {
  return {
    $type: 'color',
    $value: dtcgColorValueFromSerialized(swatch.serialized),
    $description: `Neutral primitive ${swatch.label} at ramp index ${swatch.index}.`,
    $extensions: {
      'neutral-system': {
        kind: 'primitive',
        primitiveMode,
        sourceIndex: swatch.index,
        sourceLabel: swatch.label,
      },
    },
  }
}

function semanticToken(token: SystemToken, architecture: NeutralArchitectureMode, ramps: ArchitectureRamps): DtcgColorToken {
  const ramp = rampForTheme(ramps, token.theme)
  const source = ramp[token.sourceGlobalIndex]
  const canAliasPrimitive = source && !token.customColor && (token.alpha == null || token.alpha >= 1)
  const sourceReference = source
    ? primitiveAlias(source.label, architecture, token.theme)
    : undefined
  const value = canAliasPrimitive
    ? primitiveAlias(source!.label, architecture, token.theme)
    : dtcgColorValueFromSerialized(token.serialized, token.alpha ?? 1)

  return {
    $type: 'color',
    $value: value,
    $description: `Semantic color ${token.role} for ${token.theme}.`,
    $extensions: {
      'neutral-system': {
        kind: 'semantic',
        sourceIndex: token.sourceGlobalIndex,
        ...(source ? {sourceLabel: source.label} : {}),
        ...(sourceReference ? {sourceReference} : {}),
        role: token.role,
        theme: token.theme,
        ...(token.customColor ? {customColor: true} : {}),
        ...(token.alpha != null ? {alpha: token.alpha} : {}),
      },
    },
  }
}

function insertThemeTokens(
  tree: DtcgTokenTree,
  themeKey: 'light' | 'dark',
  tokens: SystemToken[],
  architecture: NeutralArchitectureMode,
  ramps: ArchitectureRamps,
): void {
  tokens.forEach((token) => {
    insertToken(
      tree,
      ['color', 'semantic', themeKey, ...token.role.split('.')],
      semanticToken(token, architecture, ramps),
    )
  })
}

/** DTCG JSON — primitives + semantics; paths follow Simple (`color.neutral.*`) vs Advanced (`color.neutral.light|dark.*`). */
export function buildDtcgTokenTree(params: {
  architecture: NeutralArchitectureMode
  /** Simple Mode single ramp */
  global?: GlobalSwatch[]
  /** Advanced Mode sibling ramps */
  lightRamp?: GlobalSwatch[]
  darkRamp?: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
}): DtcgTokenTree {
  const tree: DtcgTokenTree = {}
  let ramps: ArchitectureRamps

  if (params.architecture === 'simple') {
    const g = params.global ?? []
    ramps = {architecture: 'simple', global: g}
    g.forEach((swatch) => {
      insertToken(tree, ['color', 'neutral', swatch.label], primitiveToken(swatch, 'simple', 'global'))
    })
  } else {
    const light = params.lightRamp ?? []
    const dark = params.darkRamp ?? []
    ramps = {architecture: 'advanced', light, dark}
    light.forEach((swatch) => {
      insertToken(
        tree,
        ['color', 'neutral', 'light', swatch.label],
        primitiveToken(swatch, 'advanced', 'light'),
      )
    })
    dark.forEach((swatch) => {
      insertToken(
        tree,
        ['color', 'neutral', 'dark', swatch.label],
        primitiveToken(swatch, 'advanced', 'dark'),
      )
    })
  }

  insertThemeTokens(tree, 'light', params.light, params.architecture, ramps)
  insertThemeTokens(tree, 'dark', params.dark, params.architecture, ramps)
  return validateDtcgTokenTree(tree)
}

function formatDtcgIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '<root>'
      return `${path}: ${issue.message}`
    })
    .join('\n')
}

export function validateDtcgTokenTree(input: unknown): DtcgTokenTree {
  const result = dtcgSchema.DesignTokenTree.safeParse(input)
  if (!result.success) {
    throw new Error(`Invalid DTCG design token JSON:\n${formatDtcgIssues(result.error)}`)
  }
  return result.data as DtcgTokenTree
}

export function renderDtcgTokenJson(input: DtcgTokenTree): string {
  return JSON.stringify(validateDtcgTokenTree(input), null, 2)
}

export function parseDtcgTokenJson(json: string): DtcgTokenTree {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown JSON parse error'
    throw new Error(`Invalid JSON for DTCG design token JSON: ${message}`)
  }
  return validateDtcgTokenTree(parsed)
}
