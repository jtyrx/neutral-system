'use client'

import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'

import {
  displayLadderIndex,
  RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT,
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

const PLACEHOLDER_COUNT = RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT
const EMPTY_RAMP: GlobalSwatch[] = []
const dockRampItemClassName = 'min-w-(--ramp-swatch-min-width) flex-1'
const dockRampSegmentClassName =
  'flex min-h-32 w-full flex-col'
const dockRampSegmentPlaceholderClassName = 'bg-raised'
const dockRampSegmentLiveClassName =
  'cursor-pointer touch-manipulation border-0 outline-none transition-shadow duration-75 focus-visible:border-ring focus-visible:shadow-[var(--shadow-raised),0_0_0_3px_color-mix(in_oklch,var(--ring)_35%,transparent)] data-[kbd=true]:z-2 data-[kbd=true]:shadow-[0_0_0_2px_var(--ring),var(--shadow-raised)]'
const rampSegmentPaintClassName =
  'pointer-events-none shrink-0 transition-[filter] duration-150 group-hover:brightness-[0.98]'
const rampSegmentPaintFillClassName = 'min-h-0 flex-1'
const rampEdgeStartXlClassName = 'rounded-l-xl'
const rampEdgeEndXlClassName = 'rounded-r-xl'
const rampTooltipClassName =
  'max-w-[min(90vw,18rem)] whitespace-normal text-left font-mono text-[0.7rem] leading-[1.375]'
const rampTooltipTitleClassName =
  'font-sans text-[0.65rem] font-semibold text-popover-foreground'
const rampTooltipMutedClassName = 'text-muted-foreground'
const rampTooltipBreakClassName =
  '[overflow-wrap:anywhere] text-muted-foreground'
const rampGamutWarningClassName =
  'rounded border border-amber-border-soft bg-amber-surface-bold px-6 py-2 font-sans text-[0.6rem] text-amber-text'

type DockRampSegmentModel = {
  ariaLabel: string
  cssName: string
  dataDockItem: string
  displayIndex: number
  edgeClassName: string
  facingLabel: string
  hex: string
  index: number
  oklchCss: string
  outOfSrgb: boolean
  title: string
  hasTrailingDivider: boolean
}

type DockPlaceholderSegmentModel = {
  dataDockItem: string
  edgeClassName: string
  hasTrailingDivider: boolean
}

function dockSegmentEdgeClassName(i: number, last: number) {
  return cn(
    i === 0 && rampEdgeStartXlClassName,
    i === last && rampEdgeEndXlClassName,
  )
}

function clampRampIndex(i: number, length: number) {
  if (length <= 0) return 0
  return Math.min(Math.max(0, i), length - 1)
}

const DockRampPlaceholderSegment = memo(function DockRampPlaceholderSegment({
  dataDockItem,
  edgeClassName,
  hasTrailingDivider,
}: DockPlaceholderSegmentModel) {
  return (
    <div
      role="presentation"
      data-slot="ramp-swatch"
      data-ramp-variant="placeholder"
      data-dock-item={dataDockItem}
      className={cn(
        'ramp-swatch-segment',
        dockRampItemClassName,
        dockRampSegmentClassName,
        dockRampSegmentPlaceholderClassName,
        edgeClassName,
        hasTrailingDivider && 'border-r border-hairline/50',
      )}
    >
      <span
        className={cn(rampSegmentPaintFillClassName, 'bg-(--color-surface-raised)')}
        aria-hidden
      />
    </div>
  )
})

type DockRampSegmentProps = DockRampSegmentModel & {
  isKbd: boolean
  previewTheme: 'light' | 'dark'
  setFocusRef: (visualIndex: number, el: HTMLButtonElement | null) => void
  visualIndex: number
  onBlur: () => void
  onFocusIndex: (logicalIdx: number) => void
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
  onSelect: (logicalIdx: number) => void
}

const DockRampSegment = memo(function DockRampSegment({
  ariaLabel,
  cssName,
  dataDockItem,
  displayIndex,
  edgeClassName,
  facingLabel,
  hasTrailingDivider,
  hex,
  index,
  isKbd,
  oklchCss,
  outOfSrgb,
  previewTheme,
  setFocusRef,
  title,
  visualIndex,
  onBlur,
  onFocusIndex,
  onKeyDown,
  onSelect,
}: DockRampSegmentProps) {
  const paintStyle = useMemo<CSSProperties>(
    () => ({backgroundColor: hex}),
    [hex],
  )

  const bindFocusRef = useCallback(
    (el: HTMLButtonElement | null) => {
      setFocusRef(visualIndex, el)
    },
    [setFocusRef, visualIndex],
  )

  const handleFocus = useCallback(() => {
    onFocusIndex(index)
  }, [index, onFocusIndex])

  const handleClick = useCallback(() => {
    onSelect(index)
  }, [index, onSelect])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          ref={bindFocusRef}
          data-slot="ramp-swatch"
          data-ramp-variant="live"
          data-ramp-index={index}
          data-ramp-theme={previewTheme}
          data-dock-item={dataDockItem}
          data-kbd={isKbd ? 'true' : undefined}
          title={title}
          className={cn(
            'ramp-swatch-segment',
            dockRampItemClassName,
            dockRampSegmentClassName,
            dockRampSegmentLiveClassName,
            edgeClassName,
            hasTrailingDivider && 'border-r border-hairline/50',
          )}
          aria-label={ariaLabel}
          onFocus={handleFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onClick={handleClick}
        >
          <span
            className={cn(
              rampSegmentPaintClassName,
              rampSegmentPaintFillClassName,
              'rounded-dock-item',
            )}
            style={paintStyle}
            aria-hidden
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className={rampTooltipClassName}>
        <p className={rampTooltipTitleClassName}>{facingLabel}</p>
        <p className={rampTooltipBreakClassName}>{cssName}</p>
        <p className={rampTooltipMutedClassName}>
          ramp index {index}
          {previewTheme === 'dark' ? ` · dark display ${displayIndex}` : ''}
        </p>
        <p className={rampTooltipBreakClassName}>{hex}</p>
        <p className={rampTooltipBreakClassName}>{oklchCss}</p>
        {outOfSrgb ? (
          <p className={rampGamutWarningClassName}>Out of sRGB (display clipped)</p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
})

/** Ramp swatch segments — must be placed inside a single `DockMagnifyItem` in the parent. */
function DockRampSegmentsInner() {
  const wb = useNeutralWorkbenchOptional()
  const [kbdIdx, setKbdIdx] = useState<number | null>(null)
  const kbdIdxRef = useRef<number | null>(null)
  const selectedGlobalIndexRef = useRef<number | null>(null)
  const focusRefs = useRef<(HTMLButtonElement | null)[]>([])

  const previewTheme = wb?.previewTheme ?? 'light'
  const architecture = wb?.neutralArchitecture ?? 'simple'
  const selectGlobal = wb?.selectGlobal
  const selectedGlobalIndex =
    wb?.selection?.kind === 'global' ? wb.selection.index : null
  const ramp =
    previewTheme === 'light'
      ? wb?.lightRamp ?? EMPTY_RAMP
      : wb?.darkRamp ?? EMPTY_RAMP

  useLayoutEffect(() => {
    selectedGlobalIndexRef.current = selectedGlobalIndex
  }, [selectedGlobalIndex])

  useLayoutEffect(() => {
    focusRefs.current.length = ramp.length
  }, [ramp.length])

  const tier1Mode = useMemo(
    () => tier1ExportModeForRamp(architecture, previewTheme),
    [architecture, previewTheme],
  )

  const placeholderSegments = useMemo(() => {
    const last = PLACEHOLDER_COUNT - 1
    return Array.from({length: PLACEHOLDER_COUNT}, (_, i) => ({
      dataDockItem: `ramp-placeholder-${i}`,
      edgeClassName: dockSegmentEdgeClassName(i, last),
      hasTrailingDivider: i !== last,
    }))
  }, [])

  const liveSegments = useMemo((): DockRampSegmentModel[] => {
    const last = ramp.length - 1
    return ramp.map((s, i) => {
      const cssName = primitiveNeutralExportName(ramp, s.index, tier1Mode)
      const facingLabel = rampTier1FacingLabel(ramp, s.index, tier1Mode)

      return {
        ariaLabel: `${facingLabel} ${cssName}`,
        cssName,
        dataDockItem: `ramp-${s.index}`,
        displayIndex: displayLadderIndex(ramp, s.index, previewTheme),
        edgeClassName: dockSegmentEdgeClassName(i, last),
        facingLabel,
        hex: s.serialized.hex,
        index: s.index,
        oklchCss: s.serialized.oklchCss,
        outOfSrgb: !s.serialized.inSrgbGamut,
        title: `${facingLabel} · ${cssName}`,
        hasTrailingDivider: i !== last,
      }
    })
  }, [ramp, previewTheme, tier1Mode])

  const setKeyboardIndex = useCallback((next: number | null) => {
    kbdIdxRef.current = next
    setKbdIdx(next)
  }, [])

  const setFocusRef = useCallback(
    (visualIndex: number, el: HTMLButtonElement | null) => {
      focusRefs.current[visualIndex] = el
    },
    [],
  )

  const focusAt = useCallback((logicalIdx: number, len: number) => {
    const i = clampRampIndex(logicalIdx, len)
    focusRefs.current[i]?.focus()
  }, [])

  const handleSegmentKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const len = ramp.length
      if (!selectGlobal || len === 0) return

      let next =
        kbdIdxRef.current ??
        clampRampIndex(selectedGlobalIndexRef.current ?? 0, len)

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          next = clampRampIndex(next + 1, len)
          focusAt(next, len)
          break
        case 'ArrowLeft':
          e.preventDefault()
          next = clampRampIndex(next - 1, len)
          focusAt(next, len)
          break
        case 'Home':
          e.preventDefault()
          next = 0
          focusAt(0, len)
          break
        case 'End':
          e.preventDefault()
          next = len - 1
          focusAt(len - 1, len)
          break
        default:
          return
      }
      setKeyboardIndex(next)
      selectGlobal(next)
    },
    [ramp.length, focusAt, selectGlobal, setKeyboardIndex],
  )

  const handleFocusAt = useCallback(
    (logicalIdx: number) => {
      if (ramp.length === 0) return
      setKeyboardIndex(clampRampIndex(logicalIdx, ramp.length))
    },
    [ramp.length, setKeyboardIndex],
  )

  const handleBlur = useCallback(() => {
    setKeyboardIndex(null)
  }, [setKeyboardIndex])

  const pickGlobalSwatch = useCallback(
    (logicalIdx: number) => {
      if (!selectGlobal || ramp.length === 0) return
      const idx = clampRampIndex(logicalIdx, ramp.length)
      setKeyboardIndex(idx)
      selectGlobal(idx)
    },
    [ramp.length, selectGlobal, setKeyboardIndex],
  )

  if (!wb || ramp.length === 0) {
    return (
      <div className="flex flex-row items-end h-full w-full">
        {placeholderSegments.map((segment) => (
          <DockRampPlaceholderSegment
            key={segment.dataDockItem}
            {...segment}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-row items-end h-full w-full">
      {liveSegments.map((segment, i) => (
        <DockRampSegment
          key={segment.index}
          {...segment}
          isKbd={kbdIdx === segment.index}
          previewTheme={previewTheme}
          setFocusRef={setFocusRef}
          visualIndex={i}
          onBlur={handleBlur}
          onFocusIndex={handleFocusAt}
          onKeyDown={handleSegmentKeyDown}
          onSelect={pickGlobalSwatch}
        />
      ))}
    </div>
  )
}

export const DockRampSegments = memo(DockRampSegmentsInner)
