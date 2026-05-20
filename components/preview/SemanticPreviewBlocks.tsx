'use client'

import {memo, useMemo, useState} from 'react'

import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {semanticColorVarName} from '@/lib/neutral-engine/exportFormats'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexByRole(
  tokens: {role: string; serialized: {hex: string}}[],
  role: string,
  fallback: string,
): string {
  return tokens.find((t) => t.role === role)?.serialized.hex ?? fallback
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function CssVar({role}: {role: string}) {
  return (
    <span className="font-mono text-[0.55rem] text-white/45">
      --{semanticColorVarName(role)}
    </span>
  )
}

function PreviewBlock({
  eyebrow,
  title,
  intent,
  children,
}: {
  eyebrow: string
  title: string
  intent: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-12 rounded-lg border border-white/10 bg-black/25 p-12 sm:p-16">
      <header className="space-y-4 border-b border-white/10 pb-8">
        <p className="text-[0.6rem] font-medium uppercase tracking-wide text-white/40">{eyebrow}</p>
        <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-micro leading-snug text-white/45">{intent}</p>
      </header>
      {children}
    </section>
  )
}

// ─── Token resolution ─────────────────────────────────────────────────────────

type ResolvedColors = {
  page: string
  sunken: string
  subtle: string
  raised: string
  overlay: string
  inverse: string
  td: string
  ts: string
  tm: string
  tdis: string
  ton: string
  bs: string
  bd: string
  bStr: string
  bFocus: string
  scrimBg: string
}

function resolveColors(
  surface: {role: string; serialized: {hex: string; oklchCss: string}; alpha?: number | null}[],
  text: {role: string; serialized: {hex: string}}[],
  border: {role: string; serialized: {hex: string}}[],
  interactive: {role: string; serialized: {hex: string; oklchCss: string}; alpha?: number | null}[],
  global: GlobalSwatch[],
): ResolvedColors {
  const page = hexByRole(surface, 'surface.default', global[0]?.serialized.hex ?? '#fafafa')
  const sunken = hexByRole(surface, 'surface.sunken', page)
  const subtle = hexByRole(surface, 'surface.subtle', page)
  const raised = hexByRole(surface, 'surface.raised', page)
  const overlay = hexByRole(surface, 'surface.overlay', raised)
  const inverse = hexByRole(surface, 'surface.inverse', global[global.length - 1]?.serialized.hex ?? '#18181b')

  const td = hexByRole(text, 'text.default', '#18181b')
  const ts = hexByRole(text, 'text.subtle', td)
  const tm = hexByRole(text, 'text.muted', ts)
  const tdis = hexByRole(text, 'text.disabled', tm)
  const ton = hexByRole(text, 'text.on', '#fafafa')

  const bs = hexByRole(border, 'border.subtle', '#e4e4e7')
  const bd = hexByRole(border, 'border.default', bs)
  const bStr = hexByRole(border, 'border.strong', bd)
  const bFocus = hexByRole(border, 'border.focus', bStr)

  const scrimToken = interactive.find((t) => t.role === 'overlay.scrim')
  const scrimBg =
    scrimToken?.alpha != null && scrimToken.alpha < 1
      ? `color-mix(in oklch, ${scrimToken.serialized.oklchCss} ${Math.round(scrimToken.alpha * 100)}%, transparent)`
      : (scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)')

  return {page, sunken, subtle, raised, overlay, inverse, td, ts, tm, tdis, ton, bs, bd, bStr, bFocus, scrimBg}
}

// ─── Preview blocks ───────────────────────────────────────────────────────────

function Block1AppLayout({c}: {c: ResolvedColors}) {
  const [activeNav, setActiveNav] = useState(0)
  return (
    <PreviewBlock
      eyebrow="Block 1"
      title="Application layout & navigation"
      intent="Layered shell: recessed nav well, primary canvas, grouped workspace. Quiet nav vs active selection."
    >
      <div
        className="flex min-h-176 overflow-hidden rounded-md border"
        style={{backgroundColor: c.page, borderColor: c.bs}}
      >
        <aside
          className="flex w-[32%] shrink-0 flex-col border-r"
          style={{backgroundColor: c.sunken, borderColor: c.bs}}
        >
          <p
            className="border-b px-8 py-6 text-[0.6rem] font-medium uppercase tracking-wide"
            style={{borderColor: c.bs, color: c.tm}}
          >
            Navigation
          </p>
          <nav className="flex flex-col gap-2 p-8">
            {['Overview', 'Reports', 'Settings'].map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(i)}
                className="rounded px-8 py-6 text-left text-xs transition-colors"
                style={{
                  backgroundColor: activeNav === i ? c.page : 'transparent',
                  color: activeNav === i ? c.td : c.ts,
                  fontWeight: activeNav === i ? 600 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </nav>
          <p className="mt-auto px-8 pb-8 text-[0.55rem] leading-snug" style={{color: c.ts}}>
            <CssVar role="surface.sunken" /> sidebar · <CssVar role="surface.default" /> active ·{' '}
            <CssVar role="text.subtle" /> / <CssVar role="text.default" />
          </p>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b px-12 py-8 text-xs" style={{borderColor: c.bs, color: c.td}}>
            Main workspace <CssVar role="surface.default" />
          </div>
          <div className="flex-1 p-8 sm:p-12">
            <div className="rounded-md border p-8 sm:p-12" style={{backgroundColor: c.subtle, borderColor: c.bs}}>
              <p className="text-xs font-medium" style={{color: c.td}}>
                Panel · <CssVar role="surface.subtle" />
              </p>
              <p className="mt-4 text-micro leading-relaxed" style={{color: c.ts}}>
                Section dividers use <CssVar role="border.subtle" /> so structure reads without heavy chrome.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PreviewBlock>
  )
}

function Block2DataCard({c}: {c: ResolvedColors}) {
  const [focused, setFocused] = useState(false)
  return (
    <PreviewBlock
      eyebrow="Block 2"
      title="Interactive data card"
      intent="Raised surface = lifted analytics tile. Focus ring uses the dedicated focus token — keyboard-first, not a default border."
    >
      <div
        className="rounded-lg border p-12 sm:p-16"
        style={{
          backgroundColor: c.raised,
          borderColor: c.bd,
          boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-8">
          <h4 className="text-sm font-semibold" style={{color: c.td}}>
            Active users
          </h4>
          <span className="text-micro tabular-nums" style={{color: c.tm}}>
            Updated 14:02 UTC
          </span>
        </div>
        <p className="mt-12 text-2xl font-semibold tabular-nums tracking-tight" style={{color: c.td}}>
          12.4k
        </p>
        <button
          type="button"
          className="mt-16 rounded-md border px-12 py-6 text-xs font-medium outline-none transition-shadow"
          style={{
            backgroundColor: c.page,
            borderColor: c.bd,
            color: c.td,
            boxShadow: focused ? `0 0 0 2px ${c.page}, 0 0 0 4px ${c.bFocus}` : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          View breakdown
        </button>
        <p className="mt-8 text-[0.55rem]" style={{color: c.tm}}>
          Focus ring = <CssVar role="border.focus" /> (distinct from <CssVar role="border.default" />)
        </p>
      </div>
    </PreviewBlock>
  )
}

function Block3FormInput({c}: {c: ResolvedColors}) {
  return (
    <PreviewBlock
      eyebrow="Block 3"
      title="Form & input field"
      intent="Strong border = control boundary. Muted placeholder vs disabled read-only vs subtle help — distinct semantics."
    >
      <div className="space-y-12">
        <label className="block space-y-4">
          <span className="text-micro font-medium" style={{color: c.ts}}>
            Company
          </span>
          <div
            className="flex min-h-36 items-center rounded-md border px-8 py-6 text-sm"
            style={{borderColor: c.bStr}}
          >
            <span style={{color: c.tm}}>Search accounts…</span>
          </div>
          <span className="text-[0.55rem]" style={{color: c.ts}}>
            Placeholder tone = <CssVar role="text.muted" /> · field edge = <CssVar role="border.strong" />
          </span>
        </label>
        <label className="block space-y-4">
          <span className="text-micro font-medium" style={{color: c.ts}}>
            Read-only
          </span>
          <input
            type="text"
            readOnly
            aria-readonly="true"
            className="w-full cursor-default rounded-md border bg-transparent px-8 py-6 text-sm"
            style={{borderColor: c.bd, color: c.tdis}}
            defaultValue="INV-20418 · locked"
          />
          <span className="text-[0.55rem]" style={{color: c.ts}}>
            <CssVar role="text.disabled" />
          </span>
        </label>
        <p className="text-micro leading-snug" style={{color: c.ts}}>
          Use a shorter billing cycle to reduce variance. <CssVar role="text.subtle" />
        </p>
      </div>
    </PreviewBlock>
  )
}

function Block4Callout({c, brandPlaneOklch}: {c: ResolvedColors; brandPlaneOklch: string}) {
  return (
    <PreviewBlock
      eyebrow="Block 4"
      title="Notification & on-brand callout"
      intent="Inverse strip = semantic ramp flip. Brand strip uses surface.brand with text.on for saturated-plane ink."
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch">
        <div
          className="flex-1 rounded-md border px-12 py-10"
          style={{backgroundColor: c.inverse, borderColor: c.bd}}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            System
          </p>
          <p className="mt-4 text-xs leading-snug" style={{color: c.ton}}>
            Policy saved — your workspace will sync on next load.
          </p>
          <p className="mt-8 text-[0.55rem]" style={{color: c.ton, opacity: 0.85}}>
            <CssVar role="surface.inverse" /> + <CssVar role="text.on" />
          </p>
        </div>
        <div
          className="flex-1 rounded-md border px-12 py-10"
          style={{backgroundColor: trimCssColorValue(brandPlaneOklch), borderColor: c.bd}}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            Brand
          </p>
          <p className="mt-4 text-xs leading-snug" style={{color: c.ton}}>
            Upgrade to Pro for audit trails and SSO.
          </p>
          <p className="mt-8 text-[0.55rem]" style={{color: c.ton, opacity: 0.9}}>
            <CssVar role="surface.brand" /> + <CssVar role="text.on" />
          </p>
        </div>
      </div>
    </PreviewBlock>
  )
}

function Block5OverlayMenu({c}: {c: ResolvedColors}) {
  return (
    <PreviewBlock
      eyebrow="Block 5"
      title="Action menu overlay"
      intent="Overlay = top elevation plane for ephemeral UI. Scrim dims the canvas; menu uses overlay + default border."
    >
      <div className="relative min-h-112 rounded-md border p-12" style={{backgroundColor: c.page, borderColor: c.bs}}>
        <p className="text-xs" style={{color: c.ts}}>
          Anchor region
        </p>
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{backgroundColor: c.scrimBg}}
          aria-hidden
        />
        <div
          className="absolute left-12 top-40 z-10 min-w-176 rounded-md border py-4 shadow-xl"
          style={{backgroundColor: c.overlay, borderColor: c.bd, boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}
        >
          {(['Duplicate', 'Archive'] as const).map((action) => (
            <button key={action} type="button" className="block w-full px-12 py-8 text-left text-xs" style={{color: c.td}}>
              {action}
            </button>
          ))}
          <div className="my-4 border-t" style={{borderColor: c.bs}} />
          <button type="button" className="block w-full px-12 py-8 text-left text-xs" style={{color: c.td}}>
            Delete…
          </button>
        </div>
        <p className="absolute bottom-8 left-12 right-12 text-[0.55rem]" style={{color: c.tm}}>
          <CssVar role="surface.overlay" /> · <CssVar role="border.default" /> · <CssVar role="text.default" /> ·
          scrim <span className="font-mono text-white/40">overlay.scrim</span>
        </p>
      </div>
    </PreviewBlock>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type SemanticPreviewBlocksProps = {
  label: string
  global: GlobalSwatch[]
  tokenView: TokenView
  brandPlaneOklch: string
}

export const SemanticPreviewBlocks = memo(function SemanticPreviewBlocks({
  label,
  global,
  tokenView,
  brandPlaneOklch,
}: SemanticPreviewBlocksProps) {
  const {surface, text, border, interactive} = useMemo(
    () => ({
      surface: tokensForSemanticLayerPublic(tokenView, 'surface'),
      text: tokensForSemanticLayerPublic(tokenView, 'text'),
      border: tokensForSemanticLayerPublic(tokenView, 'border'),
      interactive: tokensForSemanticLayerPublic(tokenView, 'interactive'),
    }),
    [tokenView],
  )

  const c = useMemo(
    () => resolveColors(surface, text, border, interactive, global),
    [surface, text, border, interactive, global],
  )

  return (
    <div className="space-y-16">
      <Block1AppLayout c={c} />
      <Block2DataCard c={c} />
      <Block3FormInput c={c} />
      <Block4Callout c={c} brandPlaneOklch={brandPlaneOklch} />
      <Block5OverlayMenu c={c} />
      <p className="text-center text-[0.6rem] text-white/35">{label} · resolved semantic tokens</p>
    </div>
  )
})
