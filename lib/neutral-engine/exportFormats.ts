import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import type {SystemToken} from '@/lib/neutral-engine/types'

export function exportJson(params: {
  global: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
}): string {
  const {global, light, dark} = params
  const glob: Record<string, {oklch: string; hex: string}> = {}
  global.forEach((s) => {
    glob[`neutral-${s.label}`] = {oklch: s.serialized.oklchCss, hex: s.serialized.hex}
  })
  const pack = (tokens: SystemToken[], prefix: string) => {
    const o: Record<string, {oklch: string; hex: string; sourceIndex?: number; alpha?: number}> =
      {}
    tokens.forEach((t) => {
      o[`${prefix}-${t.name}`] = {
        oklch: t.serialized.oklchCss,
        hex: t.serialized.hex,
        sourceIndex: t.sourceGlobalIndex,
        ...(t.alpha != null ? {alpha: t.alpha} : {}),
      }
    })
    return o
  }
  return JSON.stringify(
    {
      global: glob,
      system: {
        light: pack(light, 'light'),
        dark: pack(dark, 'dark'),
      },
    },
    null,
    2,
  )
}

export function exportCssVariables(params: {
  global: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
}): string {
  const lines: string[] = [':root {']
  params.global.forEach((s) => {
    lines.push(`  --neutral-${s.label}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="light"] {')
  params.light.forEach((t) => {
    lines.push(`  --${t.name}: ${t.serialized.oklchCss};`)
  })
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="dark"] {')
  params.dark.forEach((t) => {
    const val =
      t.alpha != null && t.alpha < 1
        ? `color-mix(in oklch, ${t.serialized.oklchCss} ${Math.round(t.alpha * 100)}%, transparent)`
        : t.serialized.oklchCss
    lines.push(`  --${t.name}: ${val};`)
  })
  lines.push('}')
  return lines.join('\n')
}

export function exportCsv(global: GlobalSwatch[]): string {
  const header = ['index', 'label', 'oklch', 'hex', 'rgb']
  const rows = global.map((s) =>
    [String(s.index), s.label, s.serialized.oklchCss, s.serialized.hex, s.serialized.rgbCss].join(
      ',',
    ),
  )
  return [header.join(','), ...rows].join('\n')
}

export function exportTailwindThemeSnippet(params: {
  global: GlobalSwatch[]
}): string {
  const lines: string[] = ['// tailwind @theme extension (conceptual)', '@theme {']
  params.global.forEach((s) => {
    lines.push(`  --color-neutral-${s.label}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  return lines.join('\n')
}
