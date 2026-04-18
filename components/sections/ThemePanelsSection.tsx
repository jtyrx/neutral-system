'use client'

import {memo, useCallback, useMemo, useState} from 'react'

import {friendlySemanticCategoryLabel, humanizeRole} from '@/components/preview/previewLabels'
import {
  primitiveNeutralExportName,
  sortSystemTokensByPrimitiveLadder,
} from '@/components/preview/primitiveTokenTable'
import {type PairSection, SemanticSingleThemeGrid} from '@/components/preview/SemanticPairGrid'
import type {GlobalSwatch} from '@/lib/neutral-engine'
import type {SystemToken, TokenView} from '@/lib/neutral-engine'
import {
  tokensForInversePairCategory,
  tokensForSemanticLayer,
  tokensForSemanticLayerPublic,
  tokensForSemanticLayerPublicNonInverse,
} from '@/lib/neutral-engine/tokenViews'

type Props = {
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  onSelectSystem: (id: string) => void
}

const THEME_TABLE_GROUPS: {section: PairSection; hint: string}[] = [
  {section: {kind: 'layer', layer: 'surface'}, hint: 'base · subtle · container · elevated'},
  {section: {kind: 'layer', layer: 'border'}, hint: 'subtle · default · strong'},
  {section: {kind: 'layer', layer: 'text'}, hint: 'primary · secondary · tertiary · disabled'},
  {section: {kind: 'inverse'}, hint: 'inverse surface · text on inverse (contrast flip)'},
  {section: {kind: 'layer', layer: 'interactive'}, hint: 'state.hover · overlay.scrim'},
]

function tokensForThemeTableBlock(view: TokenView, section: PairSection): SystemToken[] {
  if (section.kind === 'inverse') return tokensForInversePairCategory(view)
  if (section.layer === 'surface' || section.layer === 'text') {
    return tokensForSemanticLayerPublicNonInverse(view, section.layer)
  }
  return tokensForSemanticLayerPublic(view, section.layer)
}

function RoleTokenTable({
  tokens,
  global,
  onSelect,
}: {
  tokens: SystemToken[]
  global: GlobalSwatch[]
  onSelect: (id: string) => void
}) {
  const sorted = useMemo(() => sortSystemTokensByPrimitiveLadder(tokens, global), [tokens, global])

  if (sorted.length === 0) {
    return <p className="text-[0.65rem] text-white/35">No tokens in this group.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[18rem] text-left text-[0.65rem]">
        <thead className="border-b border-white/10 font-mono text-white/45">
          <tr>
            <th className="px-2 py-1.5">Primitive</th>
            <th className="px-2 py-1.5">Semantic role</th>
            <th className="px-2 py-1.5 text-right">Idx</th>
            <th className="w-14 px-2 py-1.5">Swatch</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {sorted.map((t) => {
            const prim = primitiveNeutralExportName(global, t.sourceGlobalIndex)
            return (
              <tr key={t.id} className="border-b border-white/[0.06]">
                <td className="px-2 py-1.5 font-medium text-white/90" title={t.name}>
                  {prim}
                </td>
                <td className="max-w-[11rem] px-2 py-1.5 text-white/55">
                  <span className="block truncate" title={humanizeRole(t.role)}>
                    {humanizeRole(t.role)}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.6rem] text-white/35" title={t.name}>
                    {t.name}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-white/45">{t.sourceGlobalIndex}</td>
                <td className="px-2 py-1.5 align-middle">
                  <button
                    type="button"
                    className="h-8 w-8 shrink-0 rounded border border-white/10 shadow-inner"
                    style={{backgroundColor: t.serialized.hex}}
                    title={`${prim} · ${humanizeRole(t.role)}`}
                    onClick={() => onSelect(t.id)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ThemeTokenColumn({
  eyebrow,
  title,
  hint,
  tokenView,
  global,
  onSelectSystem,
  variant,
}: {
  eyebrow: string
  title: string
  hint: string
  tokenView: TokenView
  global: GlobalSwatch[]
  onSelectSystem: (id: string) => void
  variant: 'light' | 'dark'
}) {
  const [showTable, setShowTable] = useState(true)
  const toggle = useCallback(() => setShowTable((v) => !v), [])

  const shell =
    variant === 'light'
      ? 'border-amber-400/25 bg-amber-500/[0.06]'
      : 'border-sky-400/25 bg-sky-500/[0.06]'
  const heading =
    variant === 'light' ? 'text-amber-100/90' : 'text-sky-100/90'
  const eyebrowTone = variant === 'light' ? 'text-amber-200/80' : 'text-sky-200/80'

  const emphasisToks = tokensForSemanticLayer(tokenView, 'emphasis')

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${shell}`}>
      <header className="border-b border-white/10 pb-4">
        <p className={`eyebrow ${eyebrowTone}`}>{eyebrow}</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-white/50">{hint}</p>
        <button
          type="button"
          onClick={toggle}
          className="mt-3 rounded-full border border-white/12 px-2.5 py-1 text-[0.65rem] text-white/65 hover:bg-white/8 hover:text-white"
        >
          {showTable ? 'Visual view' : 'Data table'}
        </button>
        {showTable ? (
          <p className="mt-2 text-[0.6rem] leading-snug text-white/35">
            Primitive column uses tier‑1 names from the global ramp (<span className="font-mono">neutral-*</span>
            ). Rows sort by ladder value; semantic role and tier‑2 token name are secondary.
          </p>
        ) : null}
      </header>

      <div className="mt-6 space-y-8">
        {showTable ? (
          <>
            {THEME_TABLE_GROUPS.map(({section, hint}) => {
              const groupTokens = tokensForThemeTableBlock(tokenView, section)
              if (groupTokens.length === 0) return null
              const titleKey = section.kind === 'inverse' ? 'inversePair' : section.layer
              const k = section.kind === 'inverse' ? 'inverse' : section.layer
              return (
                <div key={k} className="space-y-2">
                  <h4 className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>
                    {friendlySemanticCategoryLabel(titleKey)}
                  </h4>
                  <p className="text-[0.65rem] text-white/40">{hint}</p>
                  <RoleTokenTable tokens={groupTokens} global={global} onSelect={onSelectSystem} />
                </div>
              )
            })}
            {emphasisToks.length > 0 ? (
              <div className="space-y-2 border-t border-white/10 pt-6">
                <h4 className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>Emphasis</h4>
                <p className="text-[0.65rem] text-white/40">Experimental accessible pairs (higher contrast).</p>
                <RoleTokenTable tokens={emphasisToks} global={global} onSelect={onSelectSystem} />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <SemanticSingleThemeGrid tokenView={tokenView} global={global} />
            {emphasisToks.length > 0 ? (
              <div className="space-y-2 border-t border-white/10 pt-6">
                <h4 className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>
                  Emphasis (experimental)
                </h4>
                <RoleTokenTable tokens={emphasisToks} global={global} onSelect={onSelectSystem} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function ThemePanelsSectionInner({global, lightTokenView, darkTokenView, onSelectSystem}: Props) {
  return (
    <section id="themes" className="scroll-mt-6 space-y-6">
      <header>
        <p className="eyebrow">3 · Themes</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Light vs dark elevated</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Default view is a primitive-token data table: neutral ladder names, semantic roles, and ramp
          indices. Switch to Visual for the paired layout.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-4">
        <ThemeTokenColumn
          eyebrow="Light theme"
          title="Primitive tokens"
          hint="Tier‑1 neutral-* mapping from the bright end of the global ramp (themeMode: light)."
          tokenView={lightTokenView}
          global={global}
          onSelectSystem={onSelectSystem}
          variant="light"
        />
        <ThemeTokenColumn
          eyebrow="Dark elevated"
          title="Primitive tokens"
          hint="Tier‑1 neutral-* mapping from the dark tail for elevated UI (themeMode: darkElevated)."
          tokenView={darkTokenView}
          global={global}
          onSelectSystem={onSelectSystem}
          variant="dark"
        />
      </div>
    </section>
  )
}

export const ThemePanelsSection = memo(ThemePanelsSectionInner)
