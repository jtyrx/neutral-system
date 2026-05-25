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
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip.tsx'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import {cn} from '@/lib/utils'

/** Bulk CSS: `[data-slot='ramp-swatch']` + class `ramp-swatch-segment`. Rail: `[data-slot='ramp-swatch-rail']`. Variants: `ramp-swatch:*`. Dock magnify: `data-dock-item`. */
const placeholderCount = RAMP_SWATCH_PLACEHOLDER_COUNT
const rampRailBaseClassName =
  'box-border flex min-h-0 w-full overflow-x-auto overflow-y-hidden rounded-card'
const rampRailLiveClassName =
  'cursor-default outline-none focus-visible:border-ring focus-visible:shadow-[var(--shadow-lg),0_0_0_3px_color-mix(in_oklch,var(--ring)_35%,transparent)]'
const rampRailPlaceholderClassName = 'bg-raised'
const rampRailRowClassName =
  'flex min-h-0 min-w-min w-full flex-1 flex-row self-stretch items-stretch'
const rampRailLabeledClassName = 'min-h-[3.35rem]'
const rampRailUnlabeledClassName = 'h-full min-h-32'
const rampSegmentBaseClassName =
  'relative z-0 box-border flex min-h-0 flex-1 flex-col overflow-hidden'
const rampSegmentLiveClassName =
  'cursor-pointer shadow-[inset_0_0_0_2px_transparent] transition-shadow duration-[275ms] hover:z-1 data-[kbd=true]:z-3 data-[kbd=true]:shadow-[inset_0_0_0_2px_color-mix(in_oklch,var(--ring)_80%,transparent)] data-[ramp-selected=true]:z-2 data-[ramp-selected=true]:shadow-[inset_0_0_0_2px_rgb(255_255_255_/_0.75)] active:[&_[data-slot=ramp-swatch-paint]]:brightness-[0.92]'
const rampSegmentLabeledClassName = 'flex flex-col'
const rampSegmentPlaceholderClassName = 'bg-raised'
const rampSegmentLabelClassName =
  'block min-h-12 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 pt-4 text-center font-mono text-[0.5rem] leading-none text-default tabular-nums'
const rampSegmentPaintClassName =
  'pointer-events-none shrink-0 transition-[filter] duration-150 group-hover:brightness-[0.98]'
const rampSegmentPaintLabeledClassName = 'min-h-[3.25rem] flex-1'
const rampSegmentPaintFillClassName = 'min-h-0 flex-1'
const rampEdgeStartCardClassName = 'rounded-l-input'
const rampEdgeEndCardClassName = 'rounded-r-input'
const rampTooltipClassName =
  'max-w-[min(90vw,18rem)] whitespace-normal text-left font-mono text-[0.7rem] leading-[1.375]'
const rampTooltipTitleClassName =
  'font-sans text-[0.65rem] font-semibold text-popover-foreground'
const rampTooltipBreakClassName =
  '[overflow-wrap:anywhere] text-muted-foreground'
const rampGamutWarningClassName =
  'rounded border border-amber-border-soft bg-amber-surface-bold px-6 py-2 font-sans text-[0.6rem] text-amber-text'

function railSegmentRound(i: number, last: number) {
  return cn(
    i === 0 && rampEdgeStartCardClassName,
    i === last && rampEdgeEndCardClassName,
  )
}

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

  const effectiveInvert = invertDisplay ?? false

  const orderedSwatches = useMemo(() => {
    if (effectiveInvert) return [...ramp].reverse()
    return ramp
  }, [ramp, effectiveInvert])

  const tier1Mode = useMemo(
    () => tier1ExportModeForRamp(architecture, previewTheme),
    [architecture, previewTheme],
  )

  const interactiveShellClass = cn(
    rampRailBaseClassName,
    rampRailLiveClassName,
    segmentLabels ? rampRailLabeledClassName : rampRailUnlabeledClassName,
    accentClassName,
  )

  const placeholderShellClass = cn(
    rampRailBaseClassName,
    rampRailPlaceholderClassName,
    segmentLabels ? rampRailLabeledClassName : rampRailUnlabeledClassName,
    accentClassName,
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
    const lastPlaceholder = placeholderCount - 1
    return (
      <div
        className={cn(placeholderShellClass, className)}
        data-slot="ramp-swatch-rail"
        data-ramp-state="placeholder"
        data-ramp-invert={effectiveInvert ? 'true' : undefined}
        role="img"
        aria-label="Neutral ramp preview — waiting for workbench"
      >
        <span className={rampRailRowClassName}>
          {Array.from({length: placeholderCount}, (_, i) =>
            segmentLabels ? (
              <span
                key={i}
                data-slot="ramp-swatch"
                data-ramp-variant="placeholder"
                className={cn(
                  rampSegmentBaseClassName,
                  rampSegmentLabeledClassName,
                  'ramp-swatch-segment',
                  railSegmentRound(i, lastPlaceholder),
                )}
              >
                <span className={cn(rampSegmentLabelClassName, 'opacity-0')} aria-hidden>
                  ·
                </span>
                <span
                  className={cn(rampSegmentPaintFillClassName, 'bg-raised')}
                  aria-hidden
                />
              </span>
            ) : (
              <span
                key={i}
                data-slot="ramp-swatch"
                data-ramp-variant="placeholder"
                className={cn(
                  rampSegmentBaseClassName,
                  'ramp-swatch-segment',
                  rampSegmentPlaceholderClassName,
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
      <span className={rampRailRowClassName}>
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
                    'group ramp-swatch-segment',
                    rampSegmentBaseClassName,
                    rampSegmentLiveClassName,
                    segmentLabels && rampSegmentLabeledClassName,
                    railSegmentRound(i, lastRailIndex),
                  )}
                  onClick={() => pickGlobalSwatch(s.index)}
                >
                  <span
                    data-slot="ramp-swatch-paint"
                    className={cn(
                      rampSegmentPaintClassName,
                      segmentLabels
                        ? rampSegmentPaintLabeledClassName
                        : rampSegmentPaintFillClassName,
                    )}
                    style={{backgroundColor: s.serialized.hex}}
                    aria-hidden
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                className={rampTooltipClassName}
              >
                <p className={rampTooltipTitleClassName}>{facingLabel}</p>
                <p className={rampTooltipBreakClassName}>{cssName}</p>
                <p className={rampTooltipBreakClassName}>{s.serialized.hex}</p>
                <p className={rampTooltipBreakClassName}>{s.serialized.oklchCss}</p>
                {outOfSrgb ? (
                  <p className={rampGamutWarningClassName}>
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

RampSwatchRailInner.displayName = 'RampSwatchRailInner'

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
RampSwatchRail.displayName = 'RampSwatchRail'
