'use client'

import {memo, useMemo, useState} from 'react'

import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {semanticColorVarName} from '@/lib/neutral-engine/exportFormats'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

// #region agent log
fetch('http://127.0.0.1:7417/ingest/ca6743d4-acdd-4cff-9a82-a67a2391f3e8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2dc026'},body:JSON.stringify({sessionId:'2dc026',runId:'pre-fix',hypothesisId:'H1',location:'components/preview/SemanticPreviewBlocks.tsx:10',message:'module_loaded',data:{hasSemanticColorVarName:typeof semanticColorVarName==='function'},timestamp:Date.now()})}).catch(()=>{});
// #endregion

function hexByRole(tokens: {role: string; serialized: {hex: string}}[], role: string, fb: string) {
  return tokens.find((t) => t.role === role)?.serialized.hex ?? fb
}

function CssVar({role}: {role: string}) {
  return <span className="font-mono text-[0.55rem] text-white/45">--{semanticColorVarName(role)}</span>
}

type BlockProps = {
  eyebrow: string
  title: string
  intent: string
  children: React.ReactNode
}

function PreviewBlock({eyebrow, title, intent, children}: BlockProps) {
  return (
    <section className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-3 sm:p-4">
      <header className="space-y-1 border-b border-white/10 pb-2">
        <p className="text-[0.6rem] font-medium uppercase tracking-wide text-white/40">{eyebrow}</p>
        <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-[0.65rem] leading-snug text-white/45">{intent}</p>
      </header>
      {children}
    </section>
  )
}

type ColumnProps = {
  label: string
  global: GlobalSwatch[]
  tokenView: TokenView
  /** `surface.brand` background from the same `deriveSystemTokens` path as exports, without deferred system mapping lag. */
  brandPlaneOklch: string
}

/**
 * Five enterprise UI pattern blocks — same semantic roles resolved per theme (light / dark elevated).
 */
export const SemanticPreviewBlocks = memo(function SemanticPreviewBlocks({
  label,
  global,
  tokenView,
  brandPlaneOklch,
}: ColumnProps) {
  const [activeNav, setActiveNav] = useState(0)
  const [cardActionFocus, setCardActionFocus] = useState(false)

  const {surface, text, border, interactive} = useMemo(
    () => ({
      surface: tokensForSemanticLayerPublic(tokenView, 'surface'),
      text: tokensForSemanticLayerPublic(tokenView, 'text'),
      border: tokensForSemanticLayerPublic(tokenView, 'border'),
      interactive: tokensForSemanticLayerPublic(tokenView, 'interactive'),
    }),
    [tokenView],
  )

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
      : scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)'

  return (
    <div className="space-y-4">
      <PreviewBlock
        eyebrow="Block 1"
        title="Application layout & navigation"
        intent="Layered shell: recessed nav well, primary canvas, grouped workspace. Quiet nav vs active selection."
      >
        <div
          className="flex min-h-[11rem] overflow-hidden rounded-md border"
          style={{backgroundColor: page, borderColor: bs}}
        >
          <aside
            className="flex w-[32%] shrink-0 flex-col border-r"
            style={{backgroundColor: sunken, borderColor: bs}}
          >
            <p
              className="border-b px-2 py-1.5 text-[0.6rem] font-medium uppercase tracking-wide"
              style={{borderColor: bs, color: tm}}
            >
              Navigation
            </p>
            <nav className="flex flex-col gap-0.5 p-2">
              {['Overview', 'Reports', 'Settings'].map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(i)}
                  className="rounded px-2 py-1.5 text-left text-xs transition-colors"
                  style={{
                    backgroundColor: activeNav === i ? page : 'transparent',
                    color: activeNav === i ? td : ts,
                    fontWeight: activeNav === i ? 600 : 400,
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
            <p className="mt-auto px-2 pb-2 text-[0.55rem] leading-snug" style={{color: ts}}>
              <CssVar role="surface.sunken" /> sidebar · <CssVar role="surface.default" /> active ·{' '}
              <CssVar role="text.subtle" /> / <CssVar role="text.default" />
            </p>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b px-3 py-2 text-xs" style={{borderColor: bs, color: td}}>
              Main workspace <CssVar role="surface.default" />
            </div>
            <div className="flex-1 p-2 sm:p-3">
              <div className="rounded-md border p-2 sm:p-3" style={{backgroundColor: subtle, borderColor: bs}}>
                <p className="text-xs font-medium" style={{color: td}}>
                  Panel · <CssVar role="surface.subtle" />
                </p>
                <p className="mt-1 text-[0.65rem] leading-relaxed" style={{color: ts}}>
                  Section dividers use <CssVar role="border.subtle" /> so structure reads without heavy chrome.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock
        eyebrow="Block 2"
        title="Interactive data card"
        intent="Raised surface = lifted analytics tile. Focus ring uses the dedicated focus token — keyboard-first, not a default border."
      >
        <div
          className="rounded-lg border p-3 sm:p-4"
          style={{
            backgroundColor: raised,
            borderColor: bd,
            boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-semibold" style={{color: td}}>
              Active users
            </h4>
            <span className="text-[0.65rem] tabular-nums" style={{color: tm}}>
              Updated 14:02 UTC
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight" style={{color: td}}>
            12.4k
          </p>
          <button
            type="button"
            className="mt-4 rounded-md border px-3 py-1.5 text-xs font-medium outline-none transition-shadow"
            style={{
              backgroundColor: page,
              borderColor: bd,
              color: td,
              boxShadow: cardActionFocus ? `0 0 0 2px ${page}, 0 0 0 4px ${bFocus}` : 'none',
            }}
            onFocus={() => setCardActionFocus(true)}
            onBlur={() => setCardActionFocus(false)}
          >
            View breakdown
          </button>
          <p className="mt-2 text-[0.55rem]" style={{color: tm}}>
            Focus ring = <CssVar role="border.focus" /> (distinct from <CssVar role="border.default" />)
          </p>
        </div>
      </PreviewBlock>

      <PreviewBlock
        eyebrow="Block 3"
        title="Form & input field"
        intent="Strong border = control boundary. Muted placeholder vs disabled read-only vs subtle help — distinct semantics."
      >
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-[0.65rem] font-medium" style={{color: ts}}>
              Company
            </span>
            <div
              className="flex min-h-[2.25rem] items-center rounded-md border px-2 py-1.5 text-sm"
              style={{borderColor: bStr}}
            >
              <span style={{color: tm}}>Search accounts…</span>
            </div>
            <span className="text-[0.55rem]" style={{color: ts}}>
              Placeholder tone = <CssVar role="text.muted" /> · field edge = <CssVar role="border.strong" />
            </span>
          </label>
          <label className="block space-y-1">
            <span className="text-[0.65rem] font-medium" style={{color: ts}}>
              Read-only
            </span>
            <input
              type="text"
              readOnly
              aria-readonly="true"
              className="w-full cursor-default rounded-md border bg-transparent px-2 py-1.5 text-sm"
              style={{borderColor: bd, color: tdis}}
              defaultValue="INV-20418 · locked"
            />
            <span className="text-[0.55rem]" style={{color: ts}}>
              <CssVar role="text.disabled" />
            </span>
          </label>
          <p className="text-[0.65rem] leading-snug" style={{color: ts}}>
            Use a shorter billing cycle to reduce variance. <CssVar role="text.subtle" />
          </p>
        </div>
      </PreviewBlock>

      <PreviewBlock
        eyebrow="Block 4"
        title="Notification & on-brand callout"
        intent="Inverse strip = semantic ramp flip. Brand strip uses surface.brand with text.on for saturated-plane ink."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div
            className="flex-1 rounded-md border px-3 py-2.5"
            style={{backgroundColor: inverse, borderColor: bd}}
          >
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: ton}}>
              System
            </p>
            <p className="mt-1 text-xs leading-snug" style={{color: ton}}>
              Policy saved — your workspace will sync on next load.
            </p>
            <p className="mt-2 text-[0.55rem]" style={{color: ton, opacity: 0.85}}>
              <CssVar role="surface.inverse" /> + <CssVar role="text.on" />
            </p>
          </div>
          <div
            id="brand-callout"
            className="flex-1 rounded-md border px-3 py-2.5"
            style={{backgroundColor: trimCssColorValue(brandPlaneOklch), borderColor: bd}}
          >
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: ton}}>
              Brand
            </p>
            <p className="mt-1 text-xs leading-snug" style={{color: ton}}>
              Upgrade to Pro for audit trails and SSO.
            </p>
            <p className="mt-2 text-[0.55rem]" style={{color: ton, opacity: 0.9}}>
              <CssVar role="surface.brand" /> + <CssVar role="text.on" />
            </p>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock
        eyebrow="Block 5"
        title="Action menu overlay"
        intent="Overlay = top elevation plane for ephemeral UI. Scrim dims the canvas; menu uses overlay + default border."
      >
        <div className="relative min-h-[7rem] rounded-md border p-3" style={{backgroundColor: page, borderColor: bs}}>
          <p className="text-xs" style={{color: ts}}>
            Anchor region
          </p>
          <div
            className="pointer-events-none absolute inset-0 rounded-md"
            style={{backgroundColor: scrimBg}}
            aria-hidden
          />
          <div
            className="absolute left-3 top-10 z-10 min-w-[11rem] rounded-md border py-1 shadow-xl"
            style={{backgroundColor: overlay, borderColor: bd, boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}
          >
            <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: td}}>
              Duplicate
            </button>
            <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: td}}>
              Archive
            </button>
            <div className="my-1 border-t" style={{borderColor: bs}} />
            <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: td}}>
              Delete…
            </button>
          </div>
          <p className="absolute bottom-2 left-3 right-3 text-[0.55rem]" style={{color: tm}}>
            <CssVar role="surface.overlay" /> · <CssVar role="border.default" /> · <CssVar role="text.default" /> ·
            scrim <span className="font-mono text-white/40">overlay.scrim</span>
          </p>
        </div>
      </PreviewBlock>

      <p className="text-center text-[0.6rem] text-white/35">{label} · resolved semantic tokens</p>
    </div>
  )
})
