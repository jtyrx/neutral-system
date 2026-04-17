'use client'

import {useCallback, useMemo, useState} from 'react'

import {
  exportCssVariables,
  exportCsv,
  exportJson,
  exportTailwindThemeSnippet,
} from '@/lib/neutral-engine/exportFormats'
import type {GlobalScaleConfig, GlobalSwatch, SystemMappingConfig, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  globalConfig: GlobalScaleConfig
  systemConfig: SystemMappingConfig
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
}

type Tab = 'json' | 'css' | 'csv' | 'tailwind'

export function ExportSection({
  globalConfig,
  systemConfig,
  global,
  lightTokens,
  darkTokens,
}: Props) {
  const [tab, setTab] = useState<Tab>('json')
  const [copied, setCopied] = useState(false)

  const payload = useMemo(
    () => ({
      json: exportJson({global, light: lightTokens, dark: darkTokens}),
      css: exportCssVariables({global, light: lightTokens, dark: darkTokens}),
      csv: exportCsv(global),
      tailwind: exportTailwindThemeSnippet({global}),
    }),
    [global, lightTokens, darkTokens],
  )

  const text = payload[tab]

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [text])

  const download = useCallback(
    (name: string, body: string, mime: string) => {
      const blob = new Blob([body], {type: mime})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    },
    [],
  )

  const downloadPreset = useCallback(() => {
    const body = JSON.stringify({globalConfig, systemConfig}, null, 2)
    download('neutral-system-preset.json', body, 'application/json')
  }, [globalConfig, systemConfig, download])

  const loadPreset = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as {
            globalConfig?: GlobalScaleConfig
            systemConfig?: SystemMappingConfig
          }
          if (data.globalConfig && data.systemConfig) {
            window.dispatchEvent(
              new CustomEvent('neutral-system:load-preset', {
                detail: {globalConfig: data.globalConfig, systemConfig: data.systemConfig},
              }),
            )
          }
        } catch {
          /* ignore */
        }
      }
      reader.readAsText(file)
    },
    [],
  )

  return (
    <section id="export" className="scroll-mt-6 space-y-4">
      <header>
        <p className="eyebrow">7 · Export</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Tokens</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          JSON bundles global + light/dark system roles. CSS uses{' '}
          <span className="font-mono">data-theme</span> hooks. CSV lists the global ladder only.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['json', 'css', 'csv', 'tailwind'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t ? 'border-white/40 bg-white/15 text-white' : 'border-white/12 text-white/65'
            }`}
          >
            {t === 'tailwind' ? '@theme' : t}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="ml-auto rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/85"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => download(`neutral-export.${tab === 'tailwind' ? 'css' : tab}`, text, 'text/plain')}
          className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/85"
        >
          Download
        </button>
      </div>

      <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[0.65rem] leading-relaxed text-white/80">
        {text}
      </pre>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={downloadPreset}
          className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/85"
        >
          Download preset (config JSON)
        </button>
        <label className="cursor-pointer rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/85">
          Load preset
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) loadPreset(f)
              e.target.value = ''
            }}
          />
        </label>
      </div>
    </section>
  )
}
