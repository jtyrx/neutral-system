'use client'

import {memo, useMemo} from 'react'

import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

function hexByRole(tokens: {role: string; serialized: {hex: string}}[], role: string, fb: string) {
  return tokens.find((t) => t.role === role)?.serialized.hex ?? fb
}

type ShellProps = {
  label: string
  global: GlobalSwatch[]
  tokenView: TokenView
  accentBorder: string
}

const Shell = memo(function Shell({label, global, tokenView, accentBorder}: ShellProps) {
  const {surface, text, border} = useMemo(() => {
    return {
      surface: tokensForSemanticLayerPublic(tokenView, 'surface'),
      text: tokensForSemanticLayerPublic(tokenView, 'text'),
      border: tokensForSemanticLayerPublic(tokenView, 'border'),
    }
  }, [tokenView])

  const canvas = hexByRole(surface, 'surface.base', global[0]?.serialized.hex ?? '#fafafa')
  const subtle = hexByRole(surface, 'surface.subtle', canvas)
  const container = hexByRole(surface, 'surface.container', subtle)
  const elevated = hexByRole(surface, 'surface.elevated', container)
  const inverse = hexByRole(surface, 'surface.inverse', global[global.length - 1]?.serialized.hex ?? '#18181b')

  const tp = hexByRole(text, 'text.primary', '#18181b')
  const ts = hexByRole(text, 'text.secondary', tp)
  const tt = hexByRole(text, 'text.tertiary', ts)
  const td = hexByRole(text, 'text.disabled', tt)
  const ti = hexByRole(text, 'text.inverse', '#fafafa')

  const bs = hexByRole(border, 'border.subtle', '#e4e4e7')
  const bd = hexByRole(border, 'border.default', bs)
  const bStr = hexByRole(border, 'border.strong', bd)

  return (
    <div
      className="flex min-h-[22rem] flex-col overflow-hidden rounded-sm border shadow-lg"
      style={{
        borderColor: accentBorder,
        backgroundColor: canvas,
      }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2 sm:px-4" style={{borderColor: bd}}>
        <span className="text-[0.6rem] font-semibold uppercase tracking-wider" style={{color: tt}}>
          {label}
        </span>
        <span className="rounded px-1.5 py-0.5 text-[0.55rem] font-mono" style={{backgroundColor: subtle, color: ts}}>
          App shell
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside
          className="hidden w-[28%] shrink-0 border-r sm:block"
          style={{backgroundColor: subtle, borderColor: bs}}
        >
          <p className="px-3 py-2 text-[0.6rem] font-medium uppercase tracking-wide" style={{color: tt}}>
            Sidebar
          </p>
          <p className="px-3 text-xs leading-snug" style={{color: ts}}>
            Nav · metadata
          </p>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-3 sm:p-4">
            <div
              className="rounded-xl border p-3 shadow-sm sm:p-4"
              style={{
                backgroundColor: elevated,
                borderColor: bd,
                boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.08)',
              }}
            >
              <h3 className="text-base font-semibold tracking-tight sm:text-lg" style={{color: tp}}>
                Content hierarchy
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{color: tp}}>
                Primary body uses <span className="font-mono text-[0.7rem]">text.primary</span> on{' '}
                <span className="font-mono text-[0.7rem]">surface.elevated</span>.
              </p>
              <p className="mt-2 text-sm" style={{color: ts}}>
                Secondary line — supporting copy and subheads.
              </p>
              <p className="mt-2 text-xs" style={{color: tt}}>
                Tertiary · captions
              </p>
              <p className="mt-3 text-xs" style={{color: td}}>
                Disabled state preview
              </p>
            </div>
            <div
              className="mt-3 rounded-lg border px-3 py-2 sm:px-4"
              style={{backgroundColor: container, borderColor: bs}}
            >
              <p className="text-xs" style={{color: ts}}>
                Grouped region · <span className="font-mono text-[0.65rem]">surface.container</span>
              </p>
            </div>
          </main>
          <footer
            className="border-t px-3 py-2 sm:px-4"
            style={{borderColor: bStr, backgroundColor: inverse}}
          >
            <p className="text-xs font-medium" style={{color: ti}}>
              Inverse strip · <span className="font-mono text-[0.65rem]">surface.inverse</span> +{' '}
              <span className="font-mono text-[0.65rem]">text.inverse</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
})

type Props = {
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
}

/** Light | Dark elevated side-by-side using the same semantic role names. */
export const DualThemeAppShell = memo(function DualThemeAppShell({
  global,
  lightTokenView,
  darkTokenView,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Shell label="Light" global={global} tokenView={lightTokenView} accentBorder="rgb(251 191 36 / 0.35)" />
      <Shell label="Dark elevated" global={global} tokenView={darkTokenView} accentBorder="rgb(56 189 248 / 0.35)" />
    </div>
  )
})
