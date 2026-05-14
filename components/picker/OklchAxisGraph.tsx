'use client'

import {memo, useId, useMemo} from 'react'

import {
  sweepCAtFixedLHMulti,
  sweepHAtFixedLCMulti,
  sweepLAtFixedCHMulti,
} from '@/lib/neutral-engine/gamutProbing'
import {multiGamutInDisplayTier, type DisplayGamutTier} from '@/lib/neutral-engine/displayGamut'
import type {OklchPickerTriple} from '@/lib/neutral-engine/pickerConfig'

export type OklchAxisId = 'L' | 'C' | 'H'

const W = 280
const H_BAR = 28
const PAD = 2
const C_MAX = 0.4
const SAMPLES = 72

type Props = {
  axis: OklchAxisId
  picker: OklchPickerTriple
  displayTier: DisplayGamutTier
  width?: number
  height?: number
  samples?: number
}

function OklchAxisGraphInner({
  axis,
  picker,
  displayTier,
  width = W,
  height = H_BAR,
  samples = SAMPLES,
}: Props) {
  const hatchLightId = useId()
  const hatchHeavyId = useId()

  const L = Math.min(1, Math.max(0, picker.L))
  const C = Math.max(0, picker.C)
  const Hdeg = ((picker.H % 360) + 360) % 360

  const sweeps = useMemo(() => {
    if (axis === 'L') return sweepLAtFixedCHMulti(C, Hdeg, samples)
    if (axis === 'C') return sweepCAtFixedLHMulti(L, Hdeg, samples, C_MAX)
    return sweepHAtFixedLCMulti(L, C, samples)
  }, [axis, C, Hdeg, L, samples])

  const n = sweeps.length
  const innerW = width - PAD * 2
  const innerH = height - PAD * 2
  const cw = innerW / n

  let pinX = PAD
  if (axis === 'L') pinX = PAD + L * innerW
  else if (axis === 'C') pinX = PAD + Math.min(1, C / C_MAX) * innerW
  else pinX = PAD + (Hdeg / 360) * innerW

  return (
    <svg
      width={width}
      height={height}
      className="max-w-full shrink-0 text-default"
      aria-hidden
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
            strokeOpacity={0.22}
            strokeWidth={1}
          />
        </pattern>
        <pattern
          id={hatchHeavyId}
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
            strokeOpacity={0.45}
            strokeWidth={1.25}
          />
        </pattern>
      </defs>
      {sweeps.map((s, i) => {
        const x = PAD + i * cw
        const inDisp = multiGamutInDisplayTier(s, displayTier)
        const beyondSrgb = !s.inSrgb
        const beyondDisplay = !inDisp
        return (
          <g key={i}>
            <rect
              x={x}
              y={PAD}
              width={Math.max(1, cw + 0.5)}
              height={innerH}
              fill={s.display.hex}
              opacity={beyondDisplay ? 0.35 : beyondSrgb ? 0.72 : 1}
            />
            {beyondSrgb && !beyondDisplay ? (
              <rect
                x={x}
                y={PAD}
                width={Math.max(1, cw + 0.5)}
                height={innerH}
                fill={`url(#${hatchLightId})`}
              />
            ) : null}
            {beyondDisplay ? (
              <rect
                x={x}
                y={PAD}
                width={Math.max(1, cw + 0.5)}
                height={innerH}
                fill={`url(#${hatchHeavyId})`}
              />
            ) : null}
          </g>
        )
      })}
      <line
        x1={pinX}
        y1={PAD}
        x2={pinX}
        y2={PAD + innerH}
        stroke="white"
        strokeOpacity={0.85}
        strokeWidth={1.5}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.2}
        rx={4}
      />
    </svg>
  )
}

export const OklchAxisGraph = memo(OklchAxisGraphInner)
