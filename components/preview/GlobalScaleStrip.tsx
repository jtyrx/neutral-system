'use client'

import {useMemo} from 'react'

import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  global: GlobalSwatch[]
  tokens: SystemToken[]
  /** Shown above the strip (e.g. “Light · global ramp”). */
  caption: string
  /** Accent for focus ring / column chrome. */
  accentClassName?: string
}

/**
 * Full global ramp in index order; swatches that host semantic tokens show role chips.
 */
export function GlobalScaleStrip({global, tokens, caption, accentClassName}: Props) {
  const rolesByIndex = useMemo(() => {
    const m = new Map<number, SystemToken[]>()
    for (const t of tokens) {
      const list = m.get(t.sourceGlobalIndex) ?? []
      list.push(t)
      m.set(t.sourceGlobalIndex, list)
    }
    return m
  }, [tokens])

  if (global.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-4 text-center text-xs text-white/45">
        No swatches — adjust global scale steps.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-medium tracking-wide text-white/55">{caption}</p>
      <div
        className={`overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-2 ${accentClassName ?? ''}`}
      >
        <div className="flex min-h-[3.25rem] min-w-max gap-px">
          {global.map((s) => {
            const mapped = rolesByIndex.get(s.index) ?? []
            return (
              <div
                key={s.index}
                className="flex w-5 min-w-[1.15rem] flex-col items-stretch sm:w-6 sm:min-w-[1.25rem]"
                title={`${s.label} · idx ${s.index}`}
              >
                <div
                  className="min-h-[2.25rem] flex-1 rounded-t border border-white/10"
                  style={{backgroundColor: s.serialized.hex}}
                />
                <div className="flex max-h-14 flex-wrap justify-center gap-px overflow-hidden py-0.5">
                  {mapped.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="max-w-full truncate rounded px-0.5 font-mono text-[0.5rem] leading-none text-white/70 ring-1 ring-white/15"
                      title={`${t.name} (${t.role})`}
                    >
                      {t.role.slice(0, 3)}
                    </span>
                  ))}
                  {mapped.length > 3 ? (
                    <span className="font-mono text-[0.5rem] text-white/40">+{mapped.length - 3}</span>
                  ) : null}
                </div>
                <span className="text-center font-mono text-[0.5rem] leading-none text-white/35">
                  {s.index}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
