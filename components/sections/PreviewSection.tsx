'use client'

import {memo, useMemo} from 'react'

import type {GlobalSwatch, SystemToken, TokenView} from '@/lib/neutral-engine'
import {tokensForSemanticLayer} from '@/lib/neutral-engine/tokenViews'

type Props = {
  previewTheme: 'light' | 'dark'
  global: GlobalSwatch[]
  tokenView: TokenView
  /** Larger mock UI and minimal chrome — use in the primary preview column. */
  hero?: boolean
}

const SURFACE_LAYER_LABELS = [
  'Canvas · app background',
  'Default surface',
  'Subtle surface',
  'Muted surface',
  'Raised surface',
  'Overlay · elevation',
] as const

const TEXT_SAMPLE_LABELS = [
  'Display / emphasis',
  'Body · primary',
  'Secondary',
  'Supporting',
  'Faint / tertiary',
] as const

function hexAt(tokens: SystemToken[], i: number, fallback: string): string {
  return tokens[i]?.serialized.hex ?? tokens[tokens.length - 1]?.serialized.hex ?? fallback
}

const SurfacesHierarchyMock = memo(function SurfacesHierarchyMock({
  previewTheme,
  global,
  tokenView,
  densePadding,
}: Props & {densePadding: boolean}) {
  const {surfaceTokens, textTokens, borderTokens} = useMemo(() => {
    return {
      surfaceTokens: tokensForSemanticLayer(tokenView, 'surface'),
      textTokens: tokensForSemanticLayer(tokenView, 'text'),
      borderTokens: tokensForSemanticLayer(tokenView, 'border'),
    }
  }, [tokenView])

  const canvasFallback =
    previewTheme === 'light'
      ? global[0]?.serialized.hex ?? '#f4f4f5'
      : global[global.length - 1]?.serialized.hex ?? '#09090b'

  const stroke0 = hexAt(borderTokens, 0, previewTheme === 'light' ? '#d4d4d8' : '#3f3f46')
  const stroke1 = hexAt(borderTokens, 1, stroke0)
  const stroke2 = hexAt(borderTokens, 2, stroke1)

  const f = (i: number) => hexAt(surfaceTokens, i, canvasFallback)
  const t = (i: number) => hexAt(textTokens, i, previewTheme === 'light' ? '#18181b' : '#fafafa')

  const pad = densePadding ? 'p-4 sm:p-5' : 'p-5 sm:p-8'

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-hairline ${pad} min-h-[min(26rem,52vh)] sm:min-h-[min(30rem,58vh)]`}
      style={{backgroundColor: f(0)}}
    >
      <div className="mx-auto max-w-3xl">
        <p
          className="text-[0.65rem] font-medium uppercase tracking-[0.12em]"
          style={{color: t(3)}}
        >
          UI mock · surface ramp
        </p>

        <div
          className="mt-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: f(1),
            borderColor: stroke0,
            boxShadow:
              previewTheme === 'light'
                ? '0 1px 0 rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)'
                : '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.45)',
          }}
        >
          <div className="border-b px-5 py-3 sm:px-6" style={{borderColor: stroke0}}>
            <p className="text-[0.6rem] font-medium uppercase tracking-wide opacity-70" style={{color: t(3)}}>
              {SURFACE_LAYER_LABELS[1]}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl" style={{color: t(0)}}>
              {TEXT_SAMPLE_LABELS[0]}
            </h3>
            <p className="mt-2 max-w-prose text-sm leading-relaxed" style={{color: t(1)}}>
              Body copy sits on the default surface using the primary text token. This block checks
              readability between fill and text ladders.
            </p>
            <p className="mt-2 text-sm" style={{color: t(2)}}>
              Secondary copy for subheads, metadata, and de-emphasized labels.
            </p>
          </div>

          <div className="grid gap-0 sm:grid-cols-[minmax(0,7.5rem)_1fr]">
            <aside
              className="border-b p-4 sm:border-b-0 sm:border-r rounded-bl-[0.875rem]"
              style={{
                backgroundColor: f(3),
                borderColor: stroke0,
              }}
            >
              <p className="text-[0.6rem] font-medium uppercase tracking-wide" style={{color: t(3)}}>
                {SURFACE_LAYER_LABELS[3]}
              </p>
              <p className="mt-3 text-xs leading-snug" style={{color: t(2)}}>
                Sidebar on muted fill
              </p>
              <p className="mt-2 text-[0.65rem] leading-snug" style={{color: t(4)}}>
                Quiet rail
              </p>
            </aside>

            <div className="space-y-4 p-5 sm:p-6">
              <div
                className="rounded-xl border p-4"
                style={{backgroundColor: f(2), borderColor: stroke0}}
              >
                <p className="text-[0.6rem] font-medium uppercase tracking-wide" style={{color: t(3)}}>
                  {SURFACE_LAYER_LABELS[2]}
                </p>
                <p className="mt-2 text-sm" style={{color: t(2)}}>
                  Nested content band — one step softer than the shell.
                </p>
              </div>

              <div
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: f(4),
                  borderColor: stroke1,
                  boxShadow:
                    previewTheme === 'light'
                      ? '0 2px 8px rgba(0,0,0,0.07)'
                      : '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                <p className="text-sm font-semibold" style={{color: t(0)}}>
                  {SURFACE_LAYER_LABELS[4]}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{color: t(2)}}>
                  Cards and floating panels pick up the raised fill while type hierarchy stays on the
                  text ramp.
                </p>
              </div>

              <div
                className="rounded-xl border px-4 py-3"
                style={{backgroundColor: f(5), borderColor: stroke2}}
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] font-medium uppercase tracking-wide" style={{color: t(2)}}>
                      {SURFACE_LAYER_LABELS[5]}
                    </p>
                    <p className="mt-1 text-xs" style={{color: t(3)}}>
                      Sticky actions, sheets, and high-elevation chrome.
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-mono tabular-nums" style={{color: t(4)}}>
                    disabled
                  </span>
                </div>
              </div>

              <div
                className="rounded-lg border border-dashed px-3 py-2"
                style={{borderColor: stroke0}}
              >
                <p className="text-[0.6rem] font-medium uppercase tracking-wide" style={{color: t(3)}}>
                  Text ramp
                </p>
                <div className="mt-2 space-y-1.5">
                  {TEXT_SAMPLE_LABELS.map((label, i) => (
                    <p key={label} className="text-sm leading-snug" style={{color: t(i)}}>
                      <span className="mr-1.5 inline-block w-4 font-mono text-[0.6rem] tabular-nums opacity-55" style={{color: t(3)}}>
                        {i}
                      </span>
                      {label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

function PreviewSectionInner({previewTheme, global, tokenView, hero = false}: Props) {
  if (hero) {
    return (
      <section className="space-y-5">
        <SurfacesHierarchyMock
          previewTheme={previewTheme}
          global={global}
          tokenView={tokenView}
          densePadding={false}
        />
      </section>
    )
  }

  return (
    <section className="scroll-mt-6 space-y-6">
      <header>
        <p className="eyebrow">6 · UI preview</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-default">Surfaces in context</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Surface and text tokens from the active theme, layered as a compact validation surface.
        </p>
      </header>
      <SurfacesHierarchyMock previewTheme={previewTheme} global={global} tokenView={tokenView} densePadding />
    </section>
  )
}

export const PreviewSection = memo(PreviewSectionInner)
