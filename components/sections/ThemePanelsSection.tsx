'use client'

import {humanizeRole} from '@/components/preview/previewLabels'
import type {SystemRole, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  onSelectSystem: (id: string) => void
}

const ROLE_GROUPS: {roles: SystemRole[]; heading: string; hint: string}[] = [
  {
    roles: ['fill'],
    heading: 'Fills',
    hint: 'Surface and background fills',
  },
  {
    roles: ['stroke'],
    heading: 'Strokes',
    hint: 'Borders, hairlines, dividers',
  },
  {
    roles: ['text'],
    heading: 'Text',
    hint: 'Foreground and secondary type',
  },
  {
    roles: ['alt'],
    heading: 'Alt / overlay',
    hint: 'Translucent washes',
  },
]

const CONTRAST_ROLES: SystemRole[] = ['contrastFill', 'contrastStroke', 'contrastText', 'contrastAlt']

function tokensForRoles(tokens: SystemToken[], roles: SystemRole[]) {
  const set = new Set(roles)
  return tokens.filter((t) => set.has(t.role))
}

function RoleTokenTable({
  tokens,
  onSelect,
}: {
  tokens: SystemToken[]
  onSelect: (id: string) => void
}) {
  if (tokens.length === 0) {
    return <p className="text-[0.65rem] text-white/35">No tokens in this group.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[16rem] text-left font-mono text-[0.65rem]">
        <thead className="border-b border-white/10 text-white/45">
          <tr>
            <th className="px-2 py-1.5">Role</th>
            <th className="px-2 py-1.5">Token</th>
            <th className="px-2 py-1.5">Idx</th>
            <th className="px-2 py-1.5">Swatch</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.id} className="border-b border-white/[0.06]">
              <td className="px-2 py-1.5 text-white/75">{humanizeRole(t.role)}</td>
              <td className="px-2 py-1.5 text-white/60">{t.name}</td>
              <td className="px-2 py-1.5">{t.sourceGlobalIndex}</td>
              <td className="px-2 py-1.5">
                <button
                  type="button"
                  className="h-6 w-full max-w-[5.5rem] rounded border border-white/10"
                  style={{backgroundColor: t.serialized.hex}}
                  title={t.name}
                  onClick={() => onSelect(t.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ThemeTokenColumn({
  eyebrow,
  title,
  hint,
  tokens,
  onSelectSystem,
  variant,
}: {
  eyebrow: string
  title: string
  hint: string
  tokens: SystemToken[]
  onSelectSystem: (id: string) => void
  variant: 'light' | 'dark'
}) {
  const shell =
    variant === 'light'
      ? 'border-amber-400/25 bg-amber-500/[0.06]'
      : 'border-sky-400/25 bg-sky-500/[0.06]'
  const heading =
    variant === 'light' ? 'text-amber-100/90' : 'text-sky-100/90'
  const eyebrowTone = variant === 'light' ? 'text-amber-200/80' : 'text-sky-200/80'

  const contrastToks = tokensForRoles(tokens, CONTRAST_ROLES)

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${shell}`}>
      <header className="border-b border-white/10 pb-4">
        <p className={`eyebrow ${eyebrowTone}`}>{eyebrow}</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-white/50">{hint}</p>
      </header>

      <div className="mt-6 space-y-8">
        {ROLE_GROUPS.map(({roles, heading: h, hint: sub}) => {
          const groupTokens = tokens.filter((t) => roles.includes(t.role))
          return (
            <div key={h} className="space-y-2">
              <div>
                <h4 className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>{h}</h4>
                <p className="text-[0.65rem] text-white/40">{sub}</p>
              </div>
              <RoleTokenTable tokens={groupTokens} onSelect={onSelectSystem} />
            </div>
          )
        })}

        {contrastToks.length > 0 ? (
          <div className="space-y-2 border-t border-white/10 pt-6">
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>Contrast</h4>
              <p className="text-[0.65rem] text-white/40">Experimental contrast group tokens</p>
            </div>
            <RoleTokenTable tokens={contrastToks} onSelect={onSelectSystem} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ThemePanelsSection({lightTokens, darkTokens, onSelectSystem}: Props) {
  return (
    <section id="themes" className="scroll-mt-6 space-y-6">
      <header>
        <p className="eyebrow">3 · Themes</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Light vs dark elevated</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Tokens derived from the same mapping. Each theme is grouped by fills, strokes, and text so
          you can compare roles without mixing contexts.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <ThemeTokenColumn
          eyebrow="Light theme"
          title="Semantic tokens"
          hint="Mapped from the bright end of the global ramp (themeMode: light)."
          tokens={lightTokens}
          onSelectSystem={onSelectSystem}
          variant="light"
        />
        <ThemeTokenColumn
          eyebrow="Dark elevated"
          title="Semantic tokens"
          hint="Mapped from the dark tail for elevated UI (themeMode: darkElevated)."
          tokens={darkTokens}
          onSelectSystem={onSelectSystem}
          variant="dark"
        />
      </div>
    </section>
  )
}
