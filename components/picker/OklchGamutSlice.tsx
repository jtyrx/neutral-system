'use client'

import * as React from 'react'
import {memo, useCallback, useDeferredValue, useId, useMemo, useRef} from 'react'

import {
  gamutBoundaryPolylineAtHue,
  gamutSliceForHueMulti,
} from '@/lib/neutral-engine/gamutProbing'
import {multiGamutInDisplayTier, type DisplayGamutTier} from '@/lib/neutral-engine/displayGamut'
import type {OklchGamutTarget} from '@/lib/neutral-engine/gamutProbing'
import type {OklchPickerTriple} from '@/lib/neutral-engine/pickerConfig'

const C_MAX = 0.4
const ROWS = 48
const COLS = 56

type Props = {
  H: number
  picker: OklchPickerTriple
  displayTier: DisplayGamutTier
  onPick: (next: Pick<OklchPickerTriple, 'L' | 'C'>) => void
  width?: number
  height?: number
}

function outerGamutSpace(tier: DisplayGamutTier): OklchGamutTarget | null {
  if (tier === 'srgb') return null
  if (tier === 'p3') return 'p3'
  return 'rec2020'
}

function OklchGamutSliceInner({
  H,
  picker,
  displayTier,
  onPick,
  width = 320,
  height = 240,
}: Props) {
  const hatchLightId = useId()
  const hatchHeavyId = useId()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const Hdeg = ((H % 360) + 360) % 360
  const deferredH = useDeferredValue(Hdeg)

  const grid = useMemo(
    () => gamutSliceForHueMulti(deferredH, ROWS, COLS, C_MAX),
    [deferredH],
  )

  const srgbLoop = useMemo(
    () => gamutBoundaryPolylineAtHue(deferredH, 'srgb', 64, C_MAX),
    [deferredH],
  )

  const outerSpace = outerGamutSpace(displayTier)
  const outerLoop = useMemo(() => {
    if (!outerSpace) return null
    return gamutBoundaryPolylineAtHue(deferredH, outerSpace, 64, C_MAX)
  }, [deferredH, outerSpace])

  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const cellW = width / cols
  const cellH = height / rows

  const pinX = (picker.C / C_MAX) * width
  const pinY = (1 - picker.L) * height

  const pointerToLC = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = Math.min(width, Math.max(0, clientX - r.left))
      const y = Math.min(height, Math.max(0, clientY - r.top))
      const nextC = (x / width) * C_MAX
      const nextL = 1 - y / height
      onPick({
        L: Math.min(1, Math.max(0, Number(nextL.toFixed(4)))),
        C: Math.min(C_MAX, Math.max(0, Number(nextC.toFixed(4)))),
      })
    },
    [height, onPick, width],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
      pointerToLC(e.clientX, e.clientY)
    },
    [pointerToLC],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!(e.currentTarget as SVGSVGElement).hasPointerCapture(e.pointerId)) return
      pointerToLC(e.clientX, e.clientY)
    },
    [pointerToLC],
  )

  const outlinePoints = (loop: {x: number; y: number}[]) =>
    loop.map((p) => `${p.x * width},${(1 - p.y) * height}`).join(' ')

  return (
    <div className="space-y-4">
      <p className="ns-label text-caption text-muted">
        L×C @ H={Math.round(Hdeg)}° · multi-gamut slice (clipped sRGB hex)
      </p>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="max-w-full cursor-crosshair rounded-md border border-hairline bg-raised touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <defs>
          <pattern
            id={hatchLightId}
            width={4}
            height={4}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={4}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          </pattern>
          <pattern
            id={hatchHeavyId}
            width={3}
            height={3}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={3}
              stroke="currentColor"
              strokeOpacity={0.55}
              strokeWidth={1.25}
            />
          </pattern>
        </defs>
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            const beyondSrgb = !cell.inSrgb
            const inDisp = multiGamutInDisplayTier(cell, displayTier)
            const beyondDisplay = !inDisp
            return (
              <g key={`${ri}-${ci}`}>
                <rect
                  x={ci * cellW}
                  y={ri * cellH}
                  width={cellW + 0.5}
                  height={cellH + 0.5}
                  fill={cell.display.hex}
                  opacity={beyondDisplay ? 0.38 : beyondSrgb ? 0.8 : 1}
                />
                {beyondSrgb && !beyondDisplay ? (
                  <rect
                    x={ci * cellW}
                    y={ri * cellH}
                    width={cellW + 0.5}
                    height={cellH + 0.5}
                    fill={`url(#${hatchLightId})`}
                  />
                ) : null}
                {beyondDisplay ? (
                  <rect
                    x={ci * cellW}
                    y={ri * cellH}
                    width={cellW + 0.5}
                    height={cellH + 0.5}
                    fill={`url(#${hatchHeavyId})`}
                  />
                ) : null}
              </g>
            )
          }),
        )}
        {outerLoop ? (
          <polyline
            fill="none"
            stroke="yellow"
            strokeOpacity={0.55}
            strokeWidth={1.25}
            points={outlinePoints(outerLoop)}
          />
        ) : null}
        <polyline
          fill="none"
          stroke="white"
          strokeOpacity={0.75}
          strokeWidth={1.25}
          points={outlinePoints(srgbLoop)}
        />
        <circle
          cx={pinX}
          cy={pinY}
          r={6}
          fill="white"
          stroke="currentColor"
          strokeOpacity={0.5}
          strokeWidth={2}
          style={{pointerEvents: 'none'}}
        />
      </svg>
    </div>
  )
}

export const OklchGamutSlice = memo(OklchGamutSliceInner)
