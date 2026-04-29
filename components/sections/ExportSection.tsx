'use client'

import {memo, useCallback, useMemo, useState} from 'react'

import {cn} from '@/lib/cn'
import {
  exportCssVariables,
  exportCsv,
  exportJson,
  exportTailwindV4ThemeInline,
  isEmphasisToken,
  isPreviewOnlyBrandToken,
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

function ExportSectionInner({
  globalConfig,
  systemConfig,
  global,
  lightTokens,
  darkTokens,
}: Props) {
  const [tab, setTab] = useState<Tab>('json')
  const [copied, setCopied] = useState(false)

  // Brand: strip from all downloadable payloads. Emphasis: strip from token JSON only.
  const exportLight = useMemo(
    () => lightTokens.filter((t) => !isPreviewOnlyBrandToken(t)),
    [lightTokens],
  )
  const exportDark = useMemo(
    () => darkTokens.filter((t) => !isPreviewOnlyBrandToken(t)),
    [darkTokens],
  )
  const exportLightJson = useMemo(
    () => exportLight.filter((t) => !isEmphasisToken(t)),
    [exportLight],
  )
  const exportDarkJson = useMemo(
    () => exportDark.filter((t) => !isEmphasisToken(t)),
    [exportDark],
  )

  const text = useMemo(() => {
    switch (tab) {
      case 'json':
        return exportJson({global, light: exportLightJson, dark: exportDarkJson})
      case 'css':
        return exportCssVariables({global, light: exportLight, dark: exportDark})
      case 'csv':
        return exportCsv(global)
      case 'tailwind':
        return exportTailwindV4ThemeInline({global, light: exportLight})
      default:
        return ''
    }
  }, [tab, global, exportLight, exportDark, exportLightJson, exportDarkJson])

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
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-(--ns-text)">Tokens</h2>
        <p className="mt-2 max-w-2xl text-sm text-(--ns-text-muted)">
          JSON bundles tier-1 primitives + light/dark semantic roles (same shape as before). CSS uses{' '}
          <span className="font-mono">--color-neutral-*</span> primitives and{' '}
          <span className="font-mono">--color-surface-default</span>,{' '}
          <span className="font-mono">--color-text-default</span>,{' '}
          <span className="font-mono">--color-border-focus</span>, etc. for Tailwind-style utilities.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['json', 'css', 'csv', 'tailwind'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'ns-control-item border px-3 py-1.5 text-xs capitalize',
              tab === t
                ? 'border-(--ns-hairline-strong) bg-(--ns-overlay-strong) text-(--ns-text)'
                : 'border-(--ns-hairline) text-(--ns-text-subtle)',
            )}
          >
            {t === 'tailwind' ? '@theme' : t}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="ns-control-item ml-auto border border-(--ns-hairline) bg-(--ns-chip) px-3 py-1.5 text-xs text-(--ns-text)"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => download(`neutral-export.${tab === 'tailwind' ? 'css' : tab}`, text, 'text/plain')}
          className="ns-control-item border border-(--ns-hairline) px-3 py-1.5 text-xs text-(--ns-text)"
        >
          Download
        </button>
      </div>

      <pre className="max-h-80 overflow-auto rounded-xl border border-(--ns-hairline) bg-(--ns-surface-raised) p-4 font-mono text-[0.65rem] leading-relaxed text-(--ns-text)">
        {text}
      </pre>

      <div className="flex flex-wrap gap-3 border-t border-(--ns-hairline) pt-4">
        <button
          type="button"
          onClick={downloadPreset}
          className="ns-control-item border border-(--ns-hairline) bg-(--ns-chip) px-3 py-1.5 text-xs text-(--ns-text)"
        >
          Download preset (config JSON)
        </button>
        <label className="ns-control-item cursor-pointer border border-(--ns-hairline) bg-(--ns-chip) px-3 py-1.5 text-xs text-(--ns-text)">
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

export const ExportSection = memo(ExportSectionInner)
