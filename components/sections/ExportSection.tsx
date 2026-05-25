'use client'

import {memo, useCallback, useMemo, useState} from 'react'

import {Button} from '@/components/ui/button.tsx'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group.tsx'
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
              : architecture === 'simple' && architectureRamps.architecture === 'simple'
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
    <section id="workbench-export" className="scroll-mt-24 space-y-16">
      <header>
        <p className="eyebrow">7 · Export</p>
        <h2 className="mt-4 text-sm font-medium tracking-tight text-default">Tokens</h2>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          JSON bundles tier-1 primitives + light/dark semantic roles (same shape as before). CSS uses{' '}
          <span className="font-mono">--color-neutral-*</span> tier‑1 primitives (literal OKLCH) and{' '}
          <span className="font-mono">--color-surface-default</span>,{' '}
          <span className="font-mono">--color-text-default</span>,{' '}
          <span className="font-mono">--color-border-focus</span>, etc. for Tailwind-style utilities.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-8">
        <RadioGroup
          variant="scrim"
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
        >
          {(['json', 'css', 'csv', 'tailwind'] as const).map((t) => (
            <RadioGroupItem key={t} value={t}>
              {t === 'tailwind' ? '@theme' : t}
            </RadioGroupItem>
          ))}
        </RadioGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={copy}
          className="ml-auto"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => download(`neutral-export.${tab === 'tailwind' ? 'css' : tab}`, text, 'text/plain')}
        >
          Download
        </Button>
      </div>

      <pre className="max-h-320 overflow-auto rounded-xl border border-hairline bg-raised p-16 font-mono text-micro leading-relaxed text-default">
        {text}
      </pre>

      <div className="flex flex-wrap gap-12 border-t border-hairline pt-16">
        <Button variant="outline" size="sm" onClick={downloadPreset}>
          Download preset (config JSON)
        </Button>
        <label className="ns-control-item cursor-pointer border border-hairline bg-chip px-12 py-6 text-xs text-default">
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

ExportSectionInner.displayName = 'ExportSectionInner'

export const ExportSection = memo(ExportSectionInner)
ExportSection.displayName = 'ExportSection'
