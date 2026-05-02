'use client'

import {memo, useCallback, useMemo, useState} from 'react'

import {cn} from '@/lib/cn'
import {
  exportCssVariables,
  exportCsv,
  exportJson,
  exportTailwindV4ThemeInline,
} from '@/lib/neutral-engine/exportFormats'
import {tokensForExportChannel} from '@/lib/neutral-engine/exportTokens'
import type {
  AlphaNeutralConfig,
  ArchitectureRamps,
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
  SystemToken,
} from '@/lib/neutral-engine/types'

type Props = {
  architecture: NeutralArchitectureMode
  architectureRamps: ArchitectureRamps
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  systemConfig: SystemMappingConfig
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  alphaConfig: AlphaNeutralConfig
}

type Tab = 'json' | 'css' | 'csv' | 'tailwind'

function ExportSectionInner({
  architecture,
  architectureRamps,
  globalScale,
  lightScale,
  darkScale,
  systemConfig,
  lightTokens,
  darkTokens,
  alphaConfig,
}: Props) {
  const [tab, setTab] = useState<Tab>('json')
  const [copied, setCopied] = useState(false)

  const exportLightJson = useMemo(
    () => tokensForExportChannel(lightTokens, 'json'),
    [lightTokens],
  )
  const exportDarkJson = useMemo(
    () => tokensForExportChannel(darkTokens, 'json'),
    [darkTokens],
  )
  const exportLight = useMemo(
    () => tokensForExportChannel(lightTokens, 'css'),
    [lightTokens],
  )
  const exportDark = useMemo(
    () => tokensForExportChannel(darkTokens, 'css'),
    [darkTokens],
  )
  const exportLightTailwind = useMemo(
    () => tokensForExportChannel(lightTokens, 'tailwind'),
    [lightTokens],
  )

  const text = useMemo(() => {
    switch (tab) {
      case 'json':
        return exportJson({
          architecture,
          global:
            architecture === 'simple' && architectureRamps.architecture === 'simple'
              ? architectureRamps.global
              : undefined,
          lightRamp:
            architecture === 'advanced' && architectureRamps.architecture === 'advanced'
              ? architectureRamps.light
              : undefined,
          darkRamp:
            architecture === 'advanced' && architectureRamps.architecture === 'advanced'
              ? architectureRamps.dark
              : undefined,
          light: exportLightJson,
          dark: exportDarkJson,
        })
      case 'css':
        return exportCssVariables({
          architecture,
          ramps: architectureRamps,
          light: exportLight,
          dark: exportDark,
          alphaConfig,
        })
      case 'csv':
        return exportCsv(architectureRamps)
      case 'tailwind':
        return exportTailwindV4ThemeInline({
          architecture,
          ramps: architectureRamps,
          light: exportLightTailwind,
        })
      default:
        return ''
    }
  }, [tab, architecture, architectureRamps, exportLight, exportDark, exportLightJson, exportDarkJson, exportLightTailwind, alphaConfig])

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
    const body = JSON.stringify(
      {
        architecture,
        globalScale,
        lightScale,
        darkScale,
        systemConfig,
      },
      null,
      2,
    )
    download('neutral-system-preset.json', body, 'application/json')
  }, [architecture, globalScale, lightScale, darkScale, systemConfig, download])

  const loadPreset = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as {
            architecture?: NeutralArchitectureMode
            globalConfig?: GlobalScaleConfig
            globalScale?: GlobalScaleConfig
            lightScale?: GlobalScaleConfig
            darkScale?: GlobalScaleConfig
            systemConfig?: SystemMappingConfig
          }
          if (!data.systemConfig) return

          const detail: {
            architecture?: NeutralArchitectureMode
            globalConfig?: GlobalScaleConfig
            globalScale?: GlobalScaleConfig
            lightScale?: GlobalScaleConfig
            darkScale?: GlobalScaleConfig
            systemConfig: SystemMappingConfig
          } = {
            systemConfig: data.systemConfig,
          }
          if (data.architecture != null) detail.architecture = data.architecture
          if (data.globalScale != null) detail.globalScale = data.globalScale
          if (data.lightScale != null) detail.lightScale = data.lightScale
          if (data.darkScale != null) detail.darkScale = data.darkScale
          if (data.globalConfig != null && data.globalScale == null) detail.globalConfig = data.globalConfig

          window.dispatchEvent(new CustomEvent('neutral-system:load-preset', {detail}))
        } catch {
          /* ignore */
        }
      }
      reader.readAsText(file)
    },
    [],
  )

  return (
    <section id="workbench-export" className="scroll-mt-6 space-y-4">
      <header>
        <p className="eyebrow">7 · Export</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-(--ns-text)">Tokens</h2>
        <p className="mt-2 max-w-2xl text-sm text-(--ns-text-muted)">
          JSON bundles tier-1 primitives + light/dark semantic roles (same shape as before). CSS uses{' '}
          <span className="font-mono">--color-neutral-*</span> tier‑1 primitives (literal OKLCH) and{' '}
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
