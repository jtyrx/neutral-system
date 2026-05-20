'use client'

import type Color from 'colorjs.io'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {OklchControls} from '@/components/picker/OklchControls'
import {SegmentedControl, type SegmentedOption} from '@/components/preview/SegmentedControl'
import {Button} from '@/components/ui/button.tsx'
import {Input} from '@/components/ui/input.tsx'
import {useDisplayGamut} from '@/hooks/useDisplayGamut'
import {canonicalBrandOklchCss, tryParseBrandOklch} from '@/lib/neutral-engine/brandColor'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import type {OklchPickerTriple} from '@/lib/neutral-engine/pickerConfig'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

type Props = {
  systemConfig: SystemMappingConfig
  patchSystem: <K extends keyof SystemMappingConfig>(
    key: K,
    value: SystemMappingConfig[K],
    label?: string,
  ) => void
}

type BrandFormat = 'oklch' | 'hex' | 'rgb' | 'p3'

function parseSupportedBrandInput(raw: string, format: BrandFormat): Color | null {
  const s = raw.trim()
  if (!s) return null
  if (format === 'oklch' && !/^oklch\(/i.test(s)) return null
  if (format === 'hex' && !/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return null
  if (format === 'rgb' && !/^rgba?\(/i.test(s)) return null
  if (format === 'p3' && !/^color\(\s*display-p3/i.test(s)) return null
  // Color.js accepts all of the supported CSS forms above; we pre-filter to avoid other spaces/formats.
  return tryParseBrandOklch(s)
}

function serializeBrandColor(c: Color, format: BrandFormat): string {
  if (format === 'oklch') return canonicalBrandOklchCss(c)
  if (format === 'hex') return c.toString({format: 'hex'})
  if (format === 'rgb') return c.toString({format: 'rgb'})
  return c.to('p3').toString({format: 'css'})
}

export function BrandColorSection({systemConfig, patchSystem}: Props) {
  const committed = systemConfig.brandOklch
  const [format, setFormat] = useState<BrandFormat>('oklch')
  const [draft, setDraft] = useState(committed)
  const [p3Supported] = useState(
    () => typeof CSS !== 'undefined' && CSS.supports?.('color', 'color(display-p3 1 0 0)') === true,
  )
  const [controlsOpen, setControlsOpen] = useState(false)

  const {tier} = useDisplayGamut()

  const committedColor = useMemo(() => tryParseBrandOklch(committed), [committed])

  // Keep the active format field aligned when `brandOklch` changes from the sliders.
  useEffect(() => {
    const c = committedColor
    if (!c) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync draft to canonical `brandOklch` from outside this field
    setDraft(serializeBrandColor(c, format))
  }, [committedColor, format])

  const pickerTriple = useMemo((): OklchPickerTriple => {
    if (!committedColor) return {L: 0.5, C: 0.1, H: 0}
    const oklch = committedColor.to('oklch')
    return {
      L: Number(Number(oklch.l).toFixed(4)),
      C: Number(Number(oklch.c).toFixed(4)),
      H: Number(Number(oklch.h ?? 0).toFixed(1)),
    }
  }, [committedColor])

  const patchPicker = useCallback(
    (p: Partial<OklchPickerTriple>) => {
      const next = {...pickerTriple, ...p}
      const css = `oklch(${next.L} ${next.C} ${next.H})`
      const parsed = tryParseBrandOklch(css)
      if (parsed) patchSystem('brandOklch', canonicalBrandOklchCss(parsed), 'Brand color (OKLCH)')
    },
    [pickerTriple, patchSystem],
  )

  const commitDraftIfValid = useCallback(() => {
    const parsed = parseSupportedBrandInput(draft, format)
    if (parsed) {
      const brandCss = format === 'oklch' ? trimCssColorValue(draft) : canonicalBrandOklchCss(parsed)
      patchSystem('brandOklch', brandCss, 'Brand color (OKLCH)')
      setDraft(format === 'oklch' ? brandCss : serializeBrandColor(parsed, format))
    } else {
      const c = committedColor
      if (c) setDraft(serializeBrandColor(c, format))
    }
  }, [draft, format, patchSystem, committedColor])

  const previewCss = committedColor?.toString({format: 'css'}) ?? 'transparent'

  const formatOptions = useMemo((): SegmentedOption<BrandFormat>[] => {
    const base: SegmentedOption<BrandFormat>[] = [
      {value: 'oklch', label: 'OKLCH'},
      {value: 'hex', label: 'Hex'},
      {value: 'rgb', label: 'RGB'},
    ]
    if (p3Supported) base.push({value: 'p3', label: 'Display-P3', shortLabel: 'P3'})
    return base
  }, [p3Supported])

  const isDraftValid = draft.trim() === '' ? false : !!parseSupportedBrandInput(draft, format)

  return (
    <>
      <div className="flex flex-wrap items-center gap-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setControlsOpen((o) => !o)}
          className="border-(--chrome-amber-border-strong) bg-(--chrome-amber-surface-bold) font-semibold text-(--chrome-amber-text) hover:bg-(--chrome-amber-hover)"
        >
          Custom Brand
        </Button>
        <span
          className="inline-block h-32 w-32 shrink-0 rounded-md border border-hairline-strong shadow-inner"
          style={{background: previewCss}}
          title={committed}
          aria-label="Brand color preview"
        />
      </div>

      {controlsOpen ? (
        <div className="mt-16 space-y-16">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-8">
              <label htmlFor="brand-color-input" className="block text-micro font-medium uppercase tracking-wide text-muted">
                Brand color
              </label>
              <SegmentedControl
                aria-label="Brand color format"
                value={format}
                options={formatOptions}
                onChange={(next) => setFormat(next)}
                size="sm"
              />
            </div>
            <Input
              id="brand-color-input"
              type="text"
              spellCheck={false}
              autoComplete="off"
              className="font-mono text-xs focus:border-(--chrome-amber-border-bold) focus:ring-2 focus:ring-(--chrome-amber-ring-strong)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraftIfValid}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitDraftIfValid()
                }
              }}
              aria-invalid={draft.trim() !== '' && !isDraftValid}
            />
            {draft.trim() !== '' && !isDraftValid ? (
              <p className="mt-4 text-micro text-(--chrome-amber-text)">
                Supported formats: OKLCH, Hex, RGB, Display-P3. Invalid values are not applied.
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-hairline bg-raised p-12">
            <OklchControls picker={pickerTriple} patchPicker={patchPicker} displayTier={tier} />
          </div>
        </div>
      ) : null}
    </>
  )
}
