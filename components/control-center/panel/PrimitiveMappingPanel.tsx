'use client'

import {memo} from 'react'

import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {cn} from '@/lib/cn'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'

const LAYERS = ['surface', 'border', 'text'] as const
type Layer = (typeof LAYERS)[number]

export const PrimitiveMappingPanel = memo(function PrimitiveMappingPanel() {
  const {lightTokenView, darkTokenView, global, darkRamp, systemConfig, patchSystem} =
    useNeutralWorkbenchContext()

  const overrides = systemConfig.roleStepOverrides ?? {}

  const setOverride = (role: string, theme: 'light' | 'dark', step: number | undefined) => {
    const current = systemConfig.roleStepOverrides ?? {}
    const entry = {...(current[role] ?? {})}
    if (step === undefined) {
      delete entry[theme]
    } else {
      entry[theme] = step
    }
    const next = {...current, [role]: entry}
    if (next[role]?.light === undefined && next[role]?.dark === undefined) {
      delete next[role]
    }
    patchSystem('roleStepOverrides', next)
  }

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      <div className="border-b border-hairline px-12 py-10">
        <p className="font-mono text-nano uppercase tracking-[0.13em] text-muted">
          Semantic → Primitive
        </p>
        <p className="mt-2 text-nano text-muted leading-snug opacity-70">
          Pin any role to a specific scale step. Overrides are saved to your preset.
        </p>
      </div>

      {LAYERS.map((layer) => {
        const lightTokens = lightTokenView.byLayerPublic[layer] ?? []
        if (lightTokens.length === 0) return null
        return (
          <LayerSection
            key={layer}
            layer={layer}
            lightTokens={lightTokens}
            darkTokenView={darkTokenView}
            lightRamp={global}
            darkRamp={darkRamp}
            overrides={overrides}
            onOverride={setOverride}
          />
        )
      })}
    </div>
  )
})
PrimitiveMappingPanel.displayName = 'PrimitiveMappingPanel'

type LayerSectionProps = {
  layer: Layer
  lightTokens: SystemToken[]
  darkTokenView: TokenView
  lightRamp: GlobalSwatch[]
  darkRamp: GlobalSwatch[]
  overrides: Partial<Record<string, {light?: number; dark?: number}>>
  onOverride: (role: string, theme: 'light' | 'dark', step: number | undefined) => void
}

function LayerSection({
  layer,
  lightTokens,
  darkTokenView,
  lightRamp,
  darkRamp,
  overrides,
  onOverride,
}: LayerSectionProps) {
  return (
    <div>
      <div className="border-b border-hairline bg-sunken px-12 py-5">
        <p className="font-mono text-nano uppercase tracking-[0.14em] text-muted">{layer}</p>
      </div>
      <div className="grid grid-cols-[1fr_112px_20px_112px] items-center border-b border-hairline px-12 py-4">
        <span className="font-mono text-nano text-muted opacity-50">role</span>
        <span className="font-mono text-nano text-muted opacity-50">light</span>
        <span className="font-mono text-nano text-center text-muted opacity-50">Δ</span>
        <span className="font-mono text-nano text-muted opacity-50">dark</span>
      </div>
      {lightTokens.map((lt, i) => {
        const darkToken = darkTokenView.byLayerPublic[layer]?.find(
          (t) => t.role === lt.role,
        )
        const lightOverride = overrides[lt.role]?.light
        const darkOverride = overrides[lt.role]?.dark
        const effectiveLightIdx = lightOverride ?? lt.sourceGlobalIndex
        const effectiveDarkIdx = darkToken
          ? (darkOverride ?? darkToken.sourceGlobalIndex)
          : null
        const delta =
          effectiveDarkIdx !== null ? effectiveDarkIdx - effectiveLightIdx : null
        const isLast = i === lightTokens.length - 1

        return (
          <div
            key={lt.role}
            className={cn(
              'grid grid-cols-[1fr_112px_20px_112px] items-center px-12 py-8 hover:bg-subtle transition-colors',
              !isLast && 'border-b border-hairline',
            )}
          >
            <span
              className="font-mono text-caption text-subtle truncate pr-4"
              title={lt.role}
            >
              {lt.role}
            </span>

            <StepDropdown
              value={effectiveLightIdx}
              isOverridden={lightOverride !== undefined}
              ramp={lightRamp}
              onChange={(v) => onOverride(lt.role, 'light', v)}
            />

            <span
              className={cn(
                'text-center font-mono text-nano tabular-nums',
                delta === null || delta === 0 ? 'text-muted opacity-30' : 'text-muted',
              )}
            >
              {delta === null || delta === 0
                ? '—'
                : delta > 0
                  ? `+${delta}`
                  : delta}
            </span>

            {darkToken ? (
              <StepDropdown
                value={effectiveDarkIdx!}
                isOverridden={darkOverride !== undefined}
                ramp={darkRamp}
                onChange={(v) => onOverride(lt.role, 'dark', v)}
              />
            ) : (
              <span className="font-mono text-caption text-muted opacity-20">—</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

type StepDropdownProps = {
  /** Source global index into the ramp (0 = lightest). */
  value: number
  isOverridden: boolean
  ramp: GlobalSwatch[]
  onChange: (index: number | undefined) => void
}

function StepDropdown({value, isOverridden, ramp, onChange}: StepDropdownProps) {
  const n = ramp.length
  const swatch = ramp[value] ?? null

  return (
    <div className="flex items-center gap-5">
      {swatch && (
        <span
          className="inline-block size-25 shrink-0 rounded-[2px] border border-hairline"
          style={{backgroundColor: swatch.serialized.hex}}
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'appearance-none bg-transparent font-mono text-caption tabular-nums outline-none cursor-pointer',
          isOverridden ? 'text-default' : 'text-subtle',
        )}
        title={`Step ${value} — ${swatch?.serialized.hex ?? ''}`}
      >
        {Array.from({length: n}, (_, idx) => {
          const s = ramp[idx]
          return (
            <option key={idx} value={idx}>
              {s ? `${s.label} ·${idx}` : `step ${idx}`}
            </option>
          )
        })}
      </select>
      {isOverridden && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-caption text-muted opacity-50 hover:opacity-100 transition-opacity leading-none"
          aria-label="Clear override"
          title="Reset to calculated value"
        >
          ×
        </button>
      )}
    </div>
  )
}
