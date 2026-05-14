'use client'

import {Moon, Sun} from 'lucide-react'
import {
  memo,
  useMemo,
  type ChangeEvent,
  type ReactNode,
} from 'react'

import {useControlCenterPanelContext} from '@/components/control-center/ControlCenterPanelContext'
import {StepsPanel} from '@/components/control-center/panel/StepsPanel'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {Input} from '@/components/ui/input'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import {
  BORDER_STANDARD_SLOT_COUNT,
  SURFACE_STANDARD_COUNT_MAX,
} from '@/lib/neutral-engine/semanticNaming'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'
import {cn} from '@/lib/utils'

export type RoleLadder = 'surface' | 'border' | 'text'

const ROLE_LADDERS: {
  id: RoleLadder
  label: string
  dotClass: string
}[] = [
  {id: 'surface', label: 'Surface', dotClass: 'bg-sky-500/45'},
  {id: 'border', label: 'Border', dotClass: 'bg-amber-500/45'},
  {id: 'text', label: 'Text', dotClass: 'bg-violet-500/45'},
]

type RoleFieldKeys = {
  start: keyof SystemMappingConfig
  count: keyof SystemMappingConfig
  step: keyof SystemMappingConfig
  startMin: number
}

function fieldKeysFor(ladder: RoleLadder, theme: 'light' | 'dark'): RoleFieldKeys {
  if (theme === 'light') {
    if (ladder === 'surface') {
      return {
        start: 'fillStart',
        count: 'fillCount',
        step: 'lightFillStepInterval',
        startMin: 0,
      }
    }
    if (ladder === 'border') {
      return {
        start: 'strokeStart',
        count: 'strokeCount',
        step: 'lightStrokeStepInterval',
        startMin: 0,
      }
    }
    return {
      start: 'textStart',
      count: 'textCount',
      step: 'lightTextStepInterval',
      startMin: 0,
    }
  }
  if (ladder === 'surface') {
    return {
      start: 'darkFillStart',
      count: 'darkFillCount',
      step: 'darkFillStepInterval',
      startMin: -1,
    }
  }
  if (ladder === 'border') {
    return {
      start: 'darkStrokeStart',
      count: 'darkStrokeCount',
      step: 'darkStrokeStepInterval',
      startMin: 0,
    }
  }
  return {
    start: 'darkTextStart',
    count: 'darkTextCount',
    step: 'darkTextStepInterval',
    startMin: 0,
  }
}

function countMaxFor(ladder: RoleLadder): number {
  if (ladder === 'surface') return SURFACE_STANDARD_COUNT_MAX
  if (ladder === 'border') return BORDER_STANDARD_SLOT_COUNT
  return 4
}

function cellAriaLabel(
  ladder: RoleLadder,
  theme: 'light' | 'dark',
  field: 'start' | 'count' | 'step',
): string {
  const ramp = theme === 'light' ? 'Light' : 'Dark elevated'
  const role = ladder === 'surface' ? 'Surface' : ladder === 'border' ? 'Border' : 'Text'
  if (field === 'start') return `${ramp} ${role} ramp start index`
  if (field === 'count') return `${ramp} ${role} ramp segment token count`
  return `${ramp} ${role} ladder step interval`
}


function ThemeColumnPanel({
  theme,
  active,
  children,
}: {
  theme: 'light' | 'dark'
  active: boolean
  children: ReactNode
}) {
  return (
    <div
      className="cc-role-theme-column"
      aria-current={active ? 'true' : undefined}
      data-theme-column={theme}
    >
      {children}
    </div>
  )
}

function LadderCell({
  ladder,
  theme,
  field,
}: {
  ladder: RoleLadder
  theme: 'light' | 'dark'
  field: 'start' | 'count' | 'step'
}) {
  const {systemConfig, patchSystem, ladderLightSteps, ladderDarkSteps} =
    useNeutralWorkbenchContext()

  const keys = fieldKeysFor(ladder, theme)
  const stepsForTheme = theme === 'light' ? ladderLightSteps : ladderDarkSteps
  const startMax = Math.max(0, stepsForTheme - 1)
  const countMax = countMaxFor(ladder)

  const configKey =
    field === 'start' ? keys.start : field === 'count' ? keys.count : keys.step
  const min = field === 'start' ? keys.startMin : 1
  const max =
    field === 'start' ? startMax : field === 'count' ? countMax : 32
  const value = systemConfig[configKey] as number

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value)
    if (!Number.isFinite(raw)) return
    const clamped = Math.min(max, Math.max(min, Math.round(raw)))
    patchSystem(configKey, clamped)
  }

  const id = `dock-role-ladder-${ladder}-${theme}-${field}`

  return (
    <Input
      id={id}
      type="number"
      aria-label={cellAriaLabel(ladder, theme, field)}
      title={`${min}–${max}`}
      inputMode="numeric"
      min={min}
      max={max}
      step={1}
      variant="workbench"
      className="cc-role-cell-input"
      value={value}
      onChange={handleChange}
    />
  )
}

function ResolvedIndicesBlock({
  resolved,
  label,
}: {
  resolved: {surface: number[]; border: number[]; text: number[]}
  label: string
}) {
  return (
    <div>
      <p className="cc-resolved-caption">{label} (preview)</p>
      <dl className="cc-resolved-list">
        {ROLE_LADDERS.map(({id, label: rowLabel}) => (
          <div key={id} className="cc-resolved-row">
            <dt className="cc-resolved-term">{rowLabel}</dt>
            <dd className="min-w-0">{resolved[id].join(', ') || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ResolvedIndicesSummary({
  effectiveRampContext,
  resolvedLight,
  resolvedDark,
}: {
  effectiveRampContext: 'light' | 'dark' | 'both'
  resolvedLight: {surface: number[]; border: number[]; text: number[]}
  resolvedDark: {surface: number[]; border: number[]; text: number[]}
}) {
  return (
    <div className="cc-resolved-summary" data-slot="dock-role-ladder-resolved">
      <p className="cc-resolved-kicker">Resolved indices</p>
      {effectiveRampContext === 'both' ? (
        <>
          <ResolvedIndicesBlock resolved={resolvedLight} label="Light ramp" />
          <ResolvedIndicesBlock resolved={resolvedDark} label="Dark elevated ramp" />
        </>
      ) : effectiveRampContext === 'dark' ? (
        <ResolvedIndicesBlock resolved={resolvedDark} label="Dark elevated ramp" />
      ) : (
        <ResolvedIndicesBlock resolved={resolvedLight} label="Light ramp" />
      )}
    </div>
  )
}

function LightColumn() {
  return (
    <ThemeColumnPanel theme="light" active>
      <div className="cc-role-column-heading">
        <Sun className="size-3.5 shrink-0 opacity-80" aria-hidden />
        Light
      </div>
      <div className="cc-role-field-header-row">
        {(['Start', 'Count', 'Step'] as const).map((h) => (
          <span key={h} className="cc-role-field-header">{h}</span>
        ))}
      </div>
      <div className="cc-role-cell-stack">
        {ROLE_LADDERS.map(({id}) => (
          <div key={id} className="cc-role-cell-row">
            <LadderCell ladder={id} theme="light" field="start" />
            <LadderCell ladder={id} theme="light" field="count" />
            <LadderCell ladder={id} theme="light" field="step" />
          </div>
        ))}
      </div>
    </ThemeColumnPanel>
  )
}

function DarkColumn() {
  return (
    <ThemeColumnPanel theme="dark" active>
      <div className="cc-role-column-heading">
        <Moon className="size-3.5 shrink-0 opacity-80" aria-hidden />
        Dark
      </div>
      <div className="cc-role-field-header-row">
        {(['Start', 'Count', 'Step'] as const).map((h) => (
          <span key={h} className="cc-role-field-header">{h}</span>
        ))}
      </div>
      <div className="cc-role-cell-stack">
        {ROLE_LADDERS.map(({id}) => (
          <div key={id} className="cc-role-cell-row">
            <LadderCell ladder={id} theme="dark" field="start" />
            <LadderCell ladder={id} theme="dark" field="count" />
            <LadderCell ladder={id} theme="dark" field="step" />
          </div>
        ))}
      </div>
    </ThemeColumnPanel>
  )
}

function RoleMappingGrid() {
  const {effectiveRampContext} = useControlCenterPanelContext()
  const {
    effectiveMappingLight,
    effectiveMappingDark,
    ladderLightSteps,
    ladderDarkSteps,
  } = useNeutralWorkbenchContext()

  const resolvedLight = useMemo(
    () => previewResolvedRoleIndices(effectiveMappingLight, ladderLightSteps, 'light'),
    [effectiveMappingLight, ladderLightSteps],
  )

  const resolvedDark = useMemo(
    () => previewResolvedRoleIndices(effectiveMappingDark, ladderDarkSteps, 'darkElevated'),
    [effectiveMappingDark, ladderDarkSteps],
  )

  return (
    <div
      className="cc-panel-inset"
      data-slot="control-center-role-ladder-group"
      data-ramp-context={effectiveRampContext}
    >
      <div className="cc-card">
        <div className="cc-role-card-header">
          <p className="cc-card-title">Role mapping</p>
        </div>

        <div className="cc-role-grid">
          <div className="cc-role-label-rail">
            {ROLE_LADDERS.map(({id, label, dotClass}) => (
              <div key={id} className="cc-role-label">
                <span className={cn('cc-role-dot', dotClass)} aria-hidden />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          <div className="cc-role-columns">
            {effectiveRampContext !== 'dark' && <LightColumn />}
            {effectiveRampContext === 'both' && (
              <div className="cc-role-column-divider" aria-hidden />
            )}
            {effectiveRampContext !== 'light' && <DarkColumn />}
          </div>
        </div>

        <ResolvedIndicesSummary
          effectiveRampContext={effectiveRampContext}
          resolvedLight={resolvedLight}
          resolvedDark={resolvedDark}
        />
      </div>
    </div>
  )
}

function RoleMappingPanelInner() {
  return (
    <div className="cc-panel-stack flex flex-col gap-3" data-slot="control-center-panel-role-mapping">
      <section
        // aria-labelledby="control-center-role-ladder-steps-heading"
        className="cc-panel-section"
      >
        <h3
          id="control-center-role-ladder-steps-heading"
          className="cc-section-heading"
        >
          Global scale steps
        </h3>
        <StepsPanel />
      </section>

      <section aria-label="Role ramp mapping">
        <RoleMappingGrid />
      </section>
    </div>
  )
}

export const RoleMappingPanel = memo(RoleMappingPanelInner)
