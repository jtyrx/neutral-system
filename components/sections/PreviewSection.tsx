'use client'

import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  previewTheme: 'light' | 'dark'
  global: GlobalSwatch[]
  tokens: SystemToken[]
  /** Larger mock UI and minimal chrome — use in the primary preview column. */
  hero?: boolean
}

function pick(tokens: SystemToken[], role: SystemToken['role'], i = 0) {
  return tokens.filter((t) => t.role === role)[i]?.serialized.hex ?? '#888'
}

export function PreviewSection({previewTheme, global, tokens, hero = false}: Props) {
  const bg =
    previewTheme === 'light'
      ? global[0]?.serialized.hex ?? '#fff'
      : global[global.length - 1]?.serialized.hex ?? '#000'
  const surface = pick(tokens, 'fill', 0)
  const surface2 = pick(tokens, 'fill', 1)
  const border = pick(tokens, 'stroke', 0)
  const text = pick(tokens, 'text', 0)
  const text2 = pick(tokens, 'text', 1)
  const muted = pick(tokens, 'text', 2)
  const altTok = tokens.find((t) => t.role === 'alt')
  const overlayMix = altTok
    ? `color-mix(in oklch, ${altTok.serialized.oklchCss} 35%, transparent)`
    : 'transparent'

  return (
    <section className={hero ? 'space-y-5' : 'scroll-mt-6 space-y-6'}>
      {!hero ? (
        <header>
          <p className="eyebrow">6 · UI preview</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Surfaces in context</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Mock layout using mapped tokens for background, cards, borders, type, and overlay. Toggle
            light/dark preview in the Themes section.
          </p>
        </header>
      ) : null}

      <div
        className={`grid gap-4 rounded-2xl border border-white/10 lg:grid-cols-[1.1fr_0.9fr] ${
          hero ? 'min-h-[min(28rem,50vh)] p-5 sm:p-6 lg:min-h-[min(32rem,55vh)]' : 'p-4'
        }`}
        style={{backgroundColor: bg, color: text}}
      >
        <div className="space-y-4">
          <div
            className={`rounded-xl border shadow-lg ${hero ? 'p-5 sm:p-6' : 'p-4'}`}
            style={{backgroundColor: surface, borderColor: border, color: text}}
          >
            <p className={hero ? 'text-base font-semibold' : 'text-sm font-semibold'}>Card title</p>
            <p className={`mt-1 opacity-80 ${hero ? 'text-sm sm:text-base' : 'text-sm'}`} style={{color: text2}}>
              Secondary line using second text token.
            </p>
            <p className={`mt-3 ${hero ? 'text-xs sm:text-sm' : 'text-xs'}`} style={{color: muted}}>
              Tertiary / disabled tone
            </p>
            <div
              className="mt-4 flex gap-2 border-t pt-3"
              style={{borderColor: border}}
            >
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{backgroundColor: surface2, color: text}}
              >
                Button
              </span>
              <span
                className="rounded-lg border px-3 py-1.5 text-xs"
                style={{borderColor: border, color: text}}
              >
                Ghost
              </span>
            </div>
          </div>
          <div
            className="rounded-xl border px-3 py-2 font-mono text-xs"
            style={{
              backgroundColor: surface,
              borderColor: border,
              color: text,
            }}
          >
            <span className="opacity-50">Search…</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div
            className="flex flex-1 flex-col rounded-xl border"
            style={{backgroundColor: surface2, borderColor: border}}
          >
            <div
              className="border-b px-3 py-2 text-xs font-medium"
              style={{borderColor: border, color: text}}
            >
              Sidebar
            </div>
            <div className="flex-1 px-3 py-2 text-[0.65rem]" style={{color: muted}}>
              Nav item
            </div>
          </div>
          <div
            className="relative rounded-xl border p-3"
            style={{backgroundColor: surface, borderColor: border, color: text}}
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={{background: overlayMix}} />
            <p className="relative text-xs font-medium">Modal / overlay</p>
            <p className="relative mt-1 text-[0.65rem] opacity-80">
              Alt token as translucent wash.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
