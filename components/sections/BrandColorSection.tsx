'use client'

import type Color from 'colorjs.io'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'

import {SegmentedControl, type SegmentedOption} from '@/components/preview/SegmentedControl'
import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {canonicalBrandOklchCss, tryParseBrandOklch} from '@/lib/neutral-engine/brandColor'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'

type ColorPickerEl = HTMLElement & {color?: Color}

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

/**
 * Custom brand OKLCH + Color.js `<color-picker>`; shares `systemConfig.brandOklch` with token derivation.
 */
export function BrandColorSection({systemConfig, patchSystem}: Props) {
  const committed = systemConfig.brandOklch
  const [format, setFormat] = useState<BrandFormat>('oklch')
  const [draft, setDraft] = useState(committed)
  const [wcReady, setWcReady] = useState(false)
  const [p3Supported] = useState(
    () => typeof CSS !== 'undefined' && CSS.supports?.('color', 'color(display-p3 1 0 0)') === true,
  )
  const [controlsOpen, setControlsOpen] = useState(false)
  const pickerRef = useRef<ColorPickerEl | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const committedColor = useMemo(() => tryParseBrandOklch(committed), [committed])

  // Keep the active format field aligned when `brandOklch` changes from the picker (or future preset loads).
  useEffect(() => {
    const c = committedColor
    if (!c) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync draft to canonical `brandOklch` from outside this field
    setDraft(serializeBrandColor(c, format))
  }, [committedColor, format])

  useEffect(() => {
    let cancelled = false
    void Promise.all([import('color-elements/color-picker.css'), import('color-elements/color-picker')]).then(() => {
      if (!cancelled) setWcReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const commitDraftIfValid = useCallback(() => {
    const parsed = parseSupportedBrandInput(draft, format)
    if (parsed) {
      // OKLCH: keep the authored string so `surface.brand` / exports match the spec (Color.js
      // re-serialization shifts coordinates for the same sRGB). Other formats still store OKLCH.
      const brandCss = format === 'oklch' ? trimCssColorValue(draft) : canonicalBrandOklchCss(parsed)
      patchSystem('brandOklch', brandCss, 'Brand color (OKLCH)')
      setDraft(format === 'oklch' ? brandCss : serializeBrandColor(parsed, format))
    } else {
      const c = committedColor
      if (c) setDraft(serializeBrandColor(c, format))
    }
  }, [draft, format, patchSystem, committedColor])

  useLayoutEffect(() => {
    const el = pickerRef.current
    if (!el || !wcReady) return
    const parsed = committedColor
    if (!parsed) return
    try {
      if (el.color?.equals?.(parsed)) return
      el.color = parsed
    } catch {
      /* ignore picker sync errors */
    }
  }, [committedColor, wcReady])

  useEffect(() => {
    const el = pickerRef.current
    if (!el || !wcReady) return

    const syncFromPicker = () => {
      const c = el.color
      if (!c) return
      try {
        const css = canonicalBrandOklchCss(c)
        patchSystem('brandOklch', css, 'Brand color (OKLCH)')
        setDraft(serializeBrandColor(c, format))
      } catch {
        /* ignore malformed picker state */
      }
    }

    el.addEventListener('colorchange', syncFromPicker)
    el.addEventListener('input', syncFromPicker)
    return () => {
      el.removeEventListener('colorchange', syncFromPicker)
      el.removeEventListener('input', syncFromPicker)
    }
  }, [patchSystem, wcReady, format])

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
    <CollapsibleControlGroup
      id="custom-brand"
      title="Custom brand"
      subtitle="Brand input (OKLCH / Hex / RGB / Display-P3) — synced with preview, exports, and the Color.js picker."
      defaultOpen
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-(--chrome-amber-border-strong) bg-(--chrome-amber-surface-bold) px-3 py-1.5 text-xs font-semibold text-(--chrome-amber-text) transition hover:bg-(--chrome-amber-hover)"
          onClick={() => {
            setControlsOpen((o) => {
              const next = !o
              if (next) requestAnimationFrame(() => inputRef.current?.focus())
              return next
            })
          }}
        >
          Custom Brand
        </button>
        <span
          className="inline-block h-8 w-8 shrink-0 rounded-md border border-hairline-strong shadow-inner"
          style={{background: previewCss}}
          title={committed}
          aria-label="Brand color preview"
        />
      </div>

      {controlsOpen ? (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="brand-color-input" className="block text-[0.65rem] font-medium uppercase tracking-wide text-muted">
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
            <input
              ref={inputRef}
              id="brand-color-input"
              type="text"
              spellCheck={false}
              autoComplete="off"
              className="w-full rounded-lg border border-hairline bg-raised px-3 py-2 font-mono text-xs text-default outline-none transition focus:border-(--chrome-amber-border-bold) focus:ring-2 focus:ring-(--chrome-amber-ring-strong)"
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
              <p className="mt-1 text-[0.65rem] text-(--chrome-amber-text)">
                Supported formats: OKLCH, Hex, RGB, Display-P3. Invalid values are not applied.
              </p>
            ) : null}
          </div>

          {wcReady ? (
            <div className="overflow-hidden rounded-xl border border-hairline bg-raised p-2">
              {/* Hide Color.js space picker & freeform swatch input: this section only exposes OKLCH/Hex/RGB/P3 via our inputs. */}
              <color-picker ref={pickerRef} space="oklch" className="w-full max-w-full">
                <span slot="color-space" />
                <span slot="swatch" />
              </color-picker>
            </div>
          ) : (
            <p className="text-xs text-disabled">Loading color picker…</p>
          )}
        </div>
      ) : null}
    </CollapsibleControlGroup>
  )
}
