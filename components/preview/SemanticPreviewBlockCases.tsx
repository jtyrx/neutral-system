'use client'

import {memo, useMemo, useState, type ComponentType} from 'react'

import {SemanticTokenAnnotation, type TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

function hexByRole(tokens: {role: string; serialized: {hex: string}}[], role: string, fb: string) {
  return tokens.find((t) => t.role === role)?.serialized.hex ?? fb
}

type ResolvedBlockColors = {
  page: string
  sunken: string
  subtle: string
  raised: string
  overlay: string
  inverse: string
  brand: string
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

function useResolvedBlockColors(
  global: GlobalSwatch[],
  tokenView: TokenView,
  brandPlaneOklch: string,
): ResolvedBlockColors {
  return useMemo(() => {
    const surface = tokensForSemanticLayerPublic(tokenView, 'surface')
    const text = tokensForSemanticLayerPublic(tokenView, 'text')
    const border = tokensForSemanticLayerPublic(tokenView, 'border')
    const interactive = tokensForSemanticLayerPublic(tokenView, 'interactive')

    const page = hexByRole(surface, 'surface.default', global[0]?.serialized.hex ?? '#fafafa')
    const inverse = hexByRole(surface, 'surface.inverse', global[global.length - 1]?.serialized.hex ?? '#18181b')
    const scrimToken = interactive.find((t) => t.role === 'overlay.scrim')
    const scrimBg =
      scrimToken?.alpha != null && scrimToken.alpha < 1
        ? `color-mix(in oklch, ${scrimToken.serialized.oklchCss} ${Math.round(scrimToken.alpha * 100)}%, transparent)`
        : scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)'

    return {
      page,
      sunken: hexByRole(surface, 'surface.sunken', page),
      subtle: hexByRole(surface, 'surface.subtle', page),
      raised: hexByRole(surface, 'surface.raised', page),
      overlay: hexByRole(surface, 'surface.overlay', hexByRole(surface, 'surface.raised', page)),
      inverse,
      brand: trimCssColorValue(brandPlaneOklch) || 'transparent',
      td: hexByRole(text, 'text.default', '#18181b'),
      ts: hexByRole(text, 'text.subtle', hexByRole(text, 'text.default', '#18181b')),
      tm: hexByRole(text, 'text.muted', hexByRole(text, 'text.subtle', '#18181b')),
      tdis: hexByRole(text, 'text.disabled', hexByRole(text, 'text.muted', '#18181b')),
      ton: hexByRole(text, 'text.on', '#fafafa'),
      bs: hexByRole(border, 'border.subtle', '#e4e4e7'),
      bd: hexByRole(border, 'border.default', hexByRole(border, 'border.subtle', '#e4e4e7')),
      bStr: hexByRole(border, 'border.strong', hexByRole(border, 'border.default', '#e4e4e7')),
      bFocus: hexByRole(border, 'border.focus', hexByRole(border, 'border.strong', '#e4e4e7')),
      scrimBg,
    }
  }, [global, tokenView, brandPlaneOklch])
}

export type BlockCaseProps = {
  global: GlobalSwatch[]
  tokenView: TokenView
  brandPlaneOklch: string
  /** `light` for the page-surface theme, `darkElevated` for the raised-dark theme. */
  theme: TokenSelectTheme
  inspection?: boolean
  onSelectSystem?: (role: string, theme?: TokenSelectTheme) => void
}

type CaseRenderProps = BlockCaseProps & {c: ResolvedBlockColors}

function LayoutNavCase({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  const [activeNav, setActiveNav] = useState(0)
  return (
    <div className="space-y-2">
      <div
        className="flex min-h-[11rem] overflow-hidden rounded-md border"
        style={{backgroundColor: c.page, borderColor: c.bs}}
      >
        <aside
          className="flex w-[32%] shrink-0 flex-col border-r"
          style={{
            backgroundColor: c.sunken,
            borderColor: c.bs,
            boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.04), inset 2px 0 6px rgba(0,0,0,0.04)',
          }}
        >
          <p
            className="border-b px-2 py-1.5 text-[0.6rem] font-medium uppercase tracking-wide"
            style={{borderColor: c.bs, color: c.tm}}
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
                  backgroundColor: activeNav === i ? c.page : 'transparent',
                  color: activeNav === i ? c.td : c.ts,
                  fontWeight: activeNav === i ? 600 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b px-3 py-2 text-xs" style={{borderColor: c.bs, color: c.td}}>
            Main workspace
          </div>
          <div className="flex-1 p-2 sm:p-3">
            <div className="rounded-md border p-2 sm:p-3" style={{backgroundColor: c.subtle, borderColor: c.bs}}>
              <p className="text-xs font-medium" style={{color: c.td}}>
                Panel
              </p>
              <p className="mt-1 text-[0.65rem] leading-relaxed" style={{color: c.ts}}>
                Section dividers stay quiet so structure reads without heavy chrome.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[0.55rem] text-white/45">
        <span>sidebar well</span>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>active row</span>
        <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>panel</span>
        <SemanticTokenAnnotation role="surface.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>dividers</span>
        <SemanticTokenAnnotation role="border.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}

function DataCardCase({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-2">
      <div
        className="rounded-lg border p-3 sm:p-4"
        style={{
          backgroundColor: c.raised,
          borderColor: c.bd,
          boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 14px 30px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold" style={{color: c.td}}>
            Active users
          </h4>
          <span className="text-[0.65rem] tabular-nums" style={{color: c.tm}}>
            Updated 14:02 UTC
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight" style={{color: c.td}}>
          12.4k
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border px-3 py-1.5 text-xs font-medium outline-none transition-shadow"
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
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[0.55rem] text-white/45">
        <span>card surface</span>
        <SemanticTokenAnnotation role="surface.raised" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>control edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>focus ring</span>
        <SemanticTokenAnnotation role="border.focus" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}

function FormFieldCase({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-[0.65rem] font-medium text-default" style={{color: c.ts}}>
          Company
        </span>
        <div
          className="flex min-h-[2.25rem] items-center rounded-md border px-2 py-1.5 text-sm"
          style={{borderColor: c.bStr}}
        >
          <span style={{color: c.tm}}>Search accounts…</span>
        </div>
        <span className="flex flex-wrap items-center gap-x-2 text-[0.55rem] text-white/45">
          <span>placeholder</span>
          <SemanticTokenAnnotation role="text.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          <span>·</span>
          <span>field edge</span>
          <SemanticTokenAnnotation role="border.strong" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <label className="block space-y-1">
        <span className="text-[0.65rem] font-medium text-default " style={{color: c.ts}}>
          Read-only
        </span>
        <input
          type="text"
          readOnly
          aria-readonly="true"
          className="w-full cursor-default rounded-md border bg-transparent px-2 py-1.5 text-sm"
          style={{borderColor: c.bd, color: c.tdis}}
          defaultValue="INV-20418 · locked"
        />
        <span className="flex items-center gap-x-2 text-[0.55rem] text-white/45">
          <span>locked text</span>
          <SemanticTokenAnnotation role="text.disabled" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <p className="flex flex-wrap items-center gap-x-2 text-[0.65rem] leading-snug" style={{color: c.ts}}>
        <span>Use a shorter billing cycle to reduce variance.</span>
        <SemanticTokenAnnotation role="text.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </p>
    </div>
  )
}

function CalloutCase({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex-1 rounded-md border px-3 py-2.5" style={{backgroundColor: c.inverse, borderColor: c.bd}}>
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            System
          </p>
          <p className="mt-1 text-xs leading-snug" style={{color: c.ton}}>
            Policy saved — your workspace will sync on next load.
          </p>
        </div>
        <div
          id="brand-callout"
          className="flex-1 rounded-md border px-3 py-2.5"
          style={{backgroundColor: c.brand, borderColor: c.bd}}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide" style={{color: c.ton}}>
            Brand
          </p>
          <p className="mt-1 text-xs leading-snug" style={{color: c.ton}}>
            Upgrade to Pro for audit trails and SSO.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[0.55rem] text-white/45">
        <span>inverse strip</span>
        <SemanticTokenAnnotation role="surface.inverse" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>brand strip</span>
        <SemanticTokenAnnotation role="surface.brand" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}

function OverlayMenuCase({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-2">
      <div className="relative min-h-[7rem] rounded-md border p-3" style={{backgroundColor: c.page, borderColor: c.bs}}>
        <p className="text-xs" style={{color: c.ts}}>
          Anchor region
        </p>
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{backgroundColor: c.scrimBg}}
          aria-hidden
        />
        <div
          className="absolute left-3 top-10 z-10 min-w-[11rem] rounded-md border py-1 shadow-xl"
          style={{backgroundColor: c.overlay, borderColor: c.bd, boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}
        >
          <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: c.td}}>
            Duplicate
          </button>
          <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: c.td}}>
            Archive
          </button>
          <div className="my-1 border-t" style={{borderColor: c.bs}} />
          <button type="button" className="block w-full px-3 py-2 text-left text-xs" style={{color: c.td}}>
            Delete…
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[0.55rem] text-white/45">
        <span>menu plane</span>
        <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>item label</span>
        <SemanticTokenAnnotation role="text.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>scrim</span>
        <SemanticTokenAnnotation role="overlay.scrim" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}

function BlockCaseWrapper(Inner: ComponentType<CaseRenderProps>) {
  return memo(function Wrapped(props: BlockCaseProps) {
    const c = useResolvedBlockColors(props.global, props.tokenView, props.brandPlaneOklch)
    return <Inner {...props} c={c} />
  })
}

export type PreviewBlockCase = {
  id: string
  eyebrow: string
  title: string
  intent: string
  Component: ComponentType<BlockCaseProps>
}

/**
 * Ordered list of block cases driving the semantic preview workbench.
 * Adding or removing a block is an edit to this array only.
 */
export const PREVIEW_BLOCK_CASES: PreviewBlockCase[] = [
  {
    id: 'layout-nav',
    eyebrow: 'Application shell',
    title: 'Layout & navigation',
    intent: 'Layered shell: recessed nav well, primary canvas, grouped workspace. Quiet nav vs active selection.',
    Component: BlockCaseWrapper(LayoutNavCase),
  },
  {
    id: 'data-card',
    eyebrow: 'Data surface',
    title: 'Interactive data card',
    intent: 'Raised surface = lifted analytics tile. Focus ring uses the dedicated focus token — keyboard-first, not a default border.',
    Component: BlockCaseWrapper(DataCardCase),
  },
  {
    id: 'form-field',
    eyebrow: 'Input',
    title: 'Form field',
    intent: 'Strong border = control boundary. Muted placeholder vs disabled read-only vs subtle help — distinct semantics.',
    Component: BlockCaseWrapper(FormFieldCase),
  },
  {
    id: 'callout',
    eyebrow: 'Emphasis',
    title: 'Notification & brand callout',
    intent: 'Inverse strip = semantic ramp flip. Brand strip uses surface.brand with text.on for saturated-plane ink.',
    Component: BlockCaseWrapper(CalloutCase),
  },
  {
    id: 'overlay-menu',
    eyebrow: 'Ephemeral surface',
    title: 'Action menu overlay',
    intent: 'Overlay = top elevation plane for ephemeral UI. Scrim dims the canvas; menu uses overlay + default border.',
    Component: BlockCaseWrapper(OverlayMenuCase),
  },
]
