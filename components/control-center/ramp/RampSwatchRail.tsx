'use client'

import {memo, useCallback, useMemo, useState, type KeyboardEvent} from 'react'

import {
  RAMP_SWATCH_PLACEHOLDER_COUNT,
  tier1ExportModeForRamp,
} from '@/components/control-center/ramp/rampSwatchModel'
import {
  primitiveNeutralExportName,
  rampTier1FacingLabel,
} from '@/components/preview/primitiveTokenTable'
import {useNeutralWorkbenchOptional} from '@/components/providers/NeutralWorkbenchProvider'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import {cn} from '@/lib/utils'

/** Bulk CSS: `[data-slot='ramp-swatch']` + class `ramp-swatch-segment`. Rail: `[data-slot='ramp-swatch-rail']`. Variants: `ramp-swatch:*`. Dock magnify: `data-dock-item`. */
const PLACEHOLDER_COUNT = RAMP_SWATCH_PLACEHOLDER_COUNT

export type RampSwatchRailProps = {
  /** Full-width fused rail for panel chrome. */
  size?: 'panel'
  className?: string
  /** Optional chrome ring/stack (e.g. {@link rampCardAccentClass}) merged onto the fused rail shell. */
  accentClassName?: string
  /**
   * Reverse left-to-right visual segment order while keeping each segment’s logical
   * `GlobalSwatch.index` for selection and tooltips (matches GlobalRampCard dark strip).
   */
  invertDisplay?: boolean
  /**
   * When set, selects which ladder to render without changing workbench `previewTheme`
   * (e.g. OKLCH picker: inspect dark ramp while app is light).
   */
  previewThemeOverride?: 'light' | 'dark'
  /**
   * Picker fused rail shows tier-1 facing labels above each chip (dark preview uses reversed
   * `--color-neutral-dark-*` display indices; dock strip stays label-free).
   */
  segmentLabels?: boolean
}

function RampSwatchRailInner({
  size = 'panel',
  className,
  accentClassName,
  invertDisplay,
  previewThemeOverride,
  segmentLabels = false,
}: RampSwatchRailProps) {
  const wb = useNeutralWorkbenchOptional()
  const [kbdIdx, setKbdIdx] = useState<number | null>(null)

  const previewTheme = previewThemeOverride ?? wb?.previewTheme ?? 'light'
  const architecture = wb?.neutralArchitecture ?? 'simple'

  const ramp = useMemo((): GlobalSwatch[] => {
    if (!wb) return []
    return previewTheme === 'light' ? wb.lightRamp : wb.darkRamp
  }, [wb, previewTheme])

  const effectiveInvert = invertDisplay ?? (previewTheme === 'dark')

  const orderedSwatches = useMemo(() => {
    if (effectiveInvert) return [...ramp].reverse()
    return ramp
  }, [ramp, effectiveInvert])

  const tier1Mode = useMemo(
    () => tier1ExportModeForRamp(architecture, previewTheme),
    [architecture, previewTheme],
  )

  /**
   * Index-based rounding — Tooltip wrappers break `first:`/`last:` on segments.
   * First segment: `rounded-l-card`; last segment: `rounded-r-card` (clips paint to outer rail corners).
   */
  const railSegmentRound = (i: number, last: number) =>
    cn(
      i === 0 && 'cc-ramp-edge-start-card',
      i === last && 'cc-ramp-edge-end-card',
    )

  const interactiveShellClass = cn(
    'cc-ramp-rail cc-ramp-rail-live',
    segmentLabels ? 'cc-ramp-rail-labeled' : 'cc-ramp-rail-unlabeled',
    accentClassName ? accentClassName : cn(''),
    // accentClassName ? accentClassName : cn('ring-1 ring-ring/20'),
  )

  const placeholderShellClass = cn(
    'cc-ramp-rail cc-ramp-rail-placeholder',
    segmentLabels ? 'cc-ramp-rail-labeled' : 'cc-ramp-rail-unlabeled',
    accentClassName ?? '',
    // accentClassName ?? 'ring-1 ring-ring/20',
  )

  const clampIdx = useCallback(
    (i: number) => {
      if (ramp.length === 0) return 0
      return Math.min(Math.max(0, i), ramp.length - 1)
    },
    [ramp.length],
  )

  const visualPosFromLogical = useCallback(
    (logicalIndex: number) =>
      orderedSwatches.findIndex((sw) => sw.index === logicalIndex),
    [orderedSwatches],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (!wb || ramp.length === 0) return
      const fallbackLogical = clampIdx(
        wb.selection?.kind === 'global' ? wb.selection.index : 0,
      )
      const currentLogical = kbdIdx ?? fallbackLogical
      let vPos = visualPosFromLogical(currentLogical)
      if (vPos === -1) vPos = 0
      const lastV = ramp.length - 1
      let nextLogical: number

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          vPos = clampIdx(Math.min(lastV, vPos + 1))
          nextLogical = orderedSwatches[vPos]!.index
          break
        case 'ArrowLeft':
          e.preventDefault()
          vPos = clampIdx(Math.max(0, vPos - 1))
          nextLogical = orderedSwatches[vPos]!.index
          break
        case 'Home':
          e.preventDefault()
          nextLogical = orderedSwatches[0]!.index
          break
        case 'End':
          e.preventDefault()
          nextLogical = orderedSwatches[lastV]!.index
          break
        default:
          return
      }
      setKbdIdx(nextLogical)
      wb.selectGlobal(nextLogical)
    },
    [wb, ramp.length, kbdIdx, clampIdx, orderedSwatches, visualPosFromLogical],
  )

  const handleFocus = useCallback(() => {
    if (!wb || ramp.length === 0) return
    const fromSel = wb.selection?.kind === 'global' ? wb.selection.index : 0
    setKbdIdx(clampIdx(fromSel))
  }, [wb, ramp.length, clampIdx])

  const handleBlur = useCallback(() => {
    setKbdIdx(null)
  }, [])

  const pickGlobalSwatch = useCallback(
    (logicalIndex: number) => {
      if (!wb) return
      const idx = clampIdx(logicalIndex)
      setKbdIdx(idx)
      wb.selectGlobal(idx)
    },
    [wb, clampIdx],
  )

  if (!wb || ramp.length === 0) {
    const lastPlaceholder = PLACEHOLDER_COUNT - 1
    return (
      <div
        className={cn(placeholderShellClass, className)}
        data-slot="ramp-swatch-rail"
        data-ramp-state="placeholder"
        data-ramp-invert={effectiveInvert ? 'true' : undefined}
        role="img"
        aria-label="Neutral ramp preview — waiting for workbench"
      >
        <span className="cc-ramp-rail-row">
          {Array.from({length: PLACEHOLDER_COUNT}, (_, i) =>
            segmentLabels ? (
              <span
                key={i}
                data-slot="ramp-swatch"
                data-ramp-variant="placeholder"
                className={cn(
                  'cc-ramp-segment cc-ramp-segment-labeled',
                  'ramp-swatch-segment',
                  railSegmentRound(i, lastPlaceholder),
                )}
              >
                <span className="cc-ramp-segment-label opacity-0" aria-hidden>
                  ·
                </span>
                <span
                  className="cc-ramp-segment-paint-fill bg-raised"
                  aria-hidden
                />
              </span>
            ) : (
              <span
                key={i}
                data-slot="ramp-swatch"
                data-ramp-variant="placeholder"
                className={cn(
                  'cc-ramp-segment ramp-swatch-segment cc-ramp-segment-placeholder',
                  railSegmentRound(i, lastPlaceholder),
                )}
              />
            ),
          )}
        </span>
      </div>
    )
  }

  const lastRailIndex = orderedSwatches.length - 1

  return (
    <button
      type="button"
      role="group"
      aria-label="Live neutral ramp — hover a segment for token details, arrow keys to select"
      className={cn(interactiveShellClass, className)}
      data-slot="ramp-swatch-rail"
      data-ramp-state="live"
      data-ramp-size={size}
      data-ramp-theme={previewTheme}
      data-ramp-invert={effectiveInvert ? 'true' : undefined}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className="cc-ramp-rail-row">
        {orderedSwatches.map((s, i) => {
          const cssName = primitiveNeutralExportName(ramp, s.index, tier1Mode)
          const facingLabel = rampTier1FacingLabel(ramp, s.index, tier1Mode)
          const isSelected =
            wb.selection?.kind === 'global' && wb.selection.index === s.index
          const isKbd = kbdIdx === s.index
          const outOfSrgb = !s.serialized.inSrgbGamut

          return (
            <Tooltip key={s.index}>
              <TooltipTrigger asChild>
                <span
                  data-slot="ramp-swatch"
                  data-ramp-variant="live"
                  data-ramp-index={s.index}
                  data-ramp-theme={previewTheme}
                  data-ramp-selected={isSelected ? 'true' : undefined}
                  data-kbd={isKbd ? 'true' : undefined}
                  role="presentation"
                  title={`${facingLabel} · ${cssName}`}
                  className={cn(
                    'group cc-ramp-segment cc-ramp-segment-live ramp-swatch-segment',
                    segmentLabels && 'cc-ramp-segment-labeled',
                    railSegmentRound(i, lastRailIndex),
                  )}
                  onClick={() => pickGlobalSwatch(s.index)}
                >
                  {/* {segmentLabels ? (
                  <span className={rampRailSegmentLabelClass}>
                    {facingLabel}
                  </span>
                ) : null} */}
                  <span
                    data-slot="ramp-swatch-paint"
                    className={cn(
                      'cc-ramp-segment-paint',
                      segmentLabels
                        ? 'cc-ramp-segment-paint-labeled'
                        : 'cc-ramp-segment-paint-fill',
                    )}
                    style={{backgroundColor: s.serialized.hex}}
                    aria-hidden
                  />
                  {/* {segmentLabels ? (
                  <span className={rampRailSegmentLabelClass}>
                    {facingLabel}
                  </span>
                ) : null} */}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                className="cc-ramp-tooltip"
              >
                <p className="cc-ramp-tooltip-title">{facingLabel}</p>
                <p className="cc-ramp-tooltip-break">{cssName}</p>
                {/* <p className="text-muted-foreground">
                ramp index {s.index}
                {previewTheme === 'dark'
                  ? ` · dark display ${displayLadderIndex(ramp, s.index, previewTheme)}`
                  : ''}
              </p> */}
                <p className="cc-ramp-tooltip-break">{s.serialized.hex}</p>
                <p className="cc-ramp-tooltip-break">{s.serialized.oklchCss}</p>
                {outOfSrgb ? (
                  <p className="cc-ramp-gamut-warning">
                    Out of sRGB (display clipped)
                  </p>
                ) : null}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </span>
    </button>
  )
}

export const RampSwatchRail = memo(
  RampSwatchRailInner,
  (prev, next) =>
    prev.size === next.size &&
    prev.className === next.className &&
    prev.accentClassName === next.accentClassName &&
    prev.invertDisplay === next.invertDisplay &&
    prev.previewThemeOverride === next.previewThemeOverride &&
    prev.segmentLabels === next.segmentLabels,
)
