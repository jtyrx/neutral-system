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
import {Input} from '@/components/ui/input.tsx'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import {
  BORDER_STANDARD_SLOT_COUNT,
  SURFACE_STANDARD_COUNT_MAX,
} from '@/lib/neutral-engine/semanticNaming'
import type {SystemMappingConfig} from '@/lib/neutral-engine/types'
import {cn} from '@/lib/utils'

export type RoleLadder = 'surface' | 'border' | 'text'

// Dot colors are fixed categorical design constants for this panel's legend — preview-only, not semantic tokens.
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

const panelStackClassName = 'flex flex-col gap-12 px-4 pb-12'
const panelSectionClassName = 'flex flex-col gap-12'
const sectionHeadingClassName =
  'text-xs leading-[1.3] tracking-normal text-muted [text-box:trim-both_cap_alphabetic]'
const panelInsetClassName = 'px-4 pb-4'
const cardClassName =
  'rounded-xl border border-[color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)] bg-[color-mix(in_oklch,var(--muted)_20%,transparent)] px-16 py-12 shadow-sm'
const cardTitleClassName =
  'text-[0.8125rem] leading-[1.3] tracking-normal text-foreground'
const roleThemeColumnClassName =
  'min-w-0 flex-1 rounded-lg bg-[color-mix(in_oklch,var(--muted)_10%,transparent)] p-8 transition-[background-color,box-shadow] aria-[current=true]:bg-[color-mix(in_oklch,var(--muted)_30%,transparent)] aria-[current=true]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--ring)_20%,transparent)]'
const roleCellInputClassName =
  'h-32 min-h-32 w-56 min-w-56 shrink-0 [appearance:textfield] rounded-full border border-[color-mix(in_oklch,var(--chrome-hairline)_90%,transparent)] bg-[color-mix(in_oklch,var(--muted)_35%,transparent)] px-6 text-center font-mono text-xs leading-4 text-foreground tabular-nums shadow-none outline-none transition-[color,background-color,border-color,box-shadow] hover:bg-[color-mix(in_oklch,var(--muted)_50%,transparent)] focus-visible:border-ring focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--ring)_35%,transparent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
const roleCardHeaderClassName =
  'mb-12 flex min-w-0 flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-16'
const roleGridClassName = 'flex min-w-0 gap-8'
const roleLabelRailClassName =
  'flex w-[4.75rem] shrink-0 flex-col gap-y-1.5 pt-[2.125rem]'
const roleLabelClassName =
  'flex h-32 min-h-32 items-center gap-8 text-xs leading-4 font-medium text-foreground'
const roleDotClassName = 'size-6 shrink-0 rounded-full'
const roleColumnsClassName = 'flex min-w-0 flex-1 gap-8'
const roleColumnHeadingClassName =
  'flex items-center justify-center gap-4 pb-6 text-xs leading-4 font-medium text-foreground'
const roleFieldHeaderRowClassName =
  'mb-6 grid grid-cols-3 gap-x-1'
const roleFieldHeaderClassName =
  'text-center text-[0.62rem] font-medium text-muted-foreground'
const roleCellStackClassName = 'flex flex-col gap-y-1.5'
const roleCellRowClassName = 'grid grid-cols-3 gap-x-1'
const roleColumnDividerClassName =
  'w-px shrink-0 self-stretch bg-[color-mix(in_oklch,var(--border)_90%,transparent)]'
const resolvedSummaryClassName =
  'mt-12 border-t border-[color-mix(in_oklch,var(--chrome-hairline)_60%,transparent)] pt-12'
const resolvedKickerClassName =
  'text-[0.6rem] font-medium tracking-normal text-muted uppercase'
const resolvedCaptionClassName =
  'mt-2 text-[0.6rem] text-muted-foreground'
const resolvedListClassName =
  'mt-8 flex flex-col gap-4 font-mono text-[0.7rem] leading-[1.625] text-default'
const resolvedRowClassName =
  'flex min-w-0 flex-wrap gap-x-2 gap-y-0.5'
const resolvedTermClassName =
  'w-56 shrink-0 text-muted-foreground'


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
      className={roleThemeColumnClassName}
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
      className={roleCellInputClassName}
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
      <p className={resolvedCaptionClassName}>{label} (preview)</p>
      <dl className={resolvedListClassName}>
        {ROLE_LADDERS.map(({id, label: rowLabel}) => (
          <div key={id} className={resolvedRowClassName}>
            <dt className={resolvedTermClassName}>{rowLabel}</dt>
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
    <div className={resolvedSummaryClassName} data-slot="dock-role-ladder-resolved">
      <p className={resolvedKickerClassName}>Resolved indices</p>
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

const THEME_COLUMN_META = {
  light: {Icon: Sun, label: 'Light'},
  dark: {Icon: Moon, label: 'Dark'},
} as const

function ThemeColumn({theme}: {theme: 'light' | 'dark'}) {
  const {Icon, label} = THEME_COLUMN_META[theme]
  return (
    <ThemeColumnPanel theme={theme} active>
      <div className={roleColumnHeadingClassName}>
        <Icon className="size-14 shrink-0 opacity-80" aria-hidden />
        {label}
      </div>
      <div className={roleFieldHeaderRowClassName}>
        {(['Start', 'Count', 'Step'] as const).map((h) => (
          <span key={h} className={roleFieldHeaderClassName}>{h}</span>
        ))}
      </div>
      <div className={roleCellStackClassName}>
        {ROLE_LADDERS.map(({id}) => (
          <div key={id} className={roleCellRowClassName}>
            <LadderCell ladder={id} theme={theme} field="start" />
            <LadderCell ladder={id} theme={theme} field="count" />
            <LadderCell ladder={id} theme={theme} field="step" />
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
      className={panelInsetClassName}
      data-slot="control-center-role-ladder-group"
      data-ramp-context={effectiveRampContext}
    >
      <div className={cardClassName}>
        <div className={roleCardHeaderClassName}>
          <p className={cardTitleClassName}>Role mapping</p>
        </div>

        <div className={roleGridClassName}>
          <div className={roleLabelRailClassName}>
            {ROLE_LADDERS.map(({id, label, dotClass}) => (
              <div key={id} className={roleLabelClassName}>
                <span className={cn(roleDotClassName, dotClass)} aria-hidden />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          <div className={roleColumnsClassName}>
            {effectiveRampContext !== 'dark' && <ThemeColumn theme="light" />}
            {effectiveRampContext === 'both' && (
              <div className={roleColumnDividerClassName} aria-hidden />
            )}
            {effectiveRampContext !== 'light' && <ThemeColumn theme="dark" />}
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
    <div className={panelStackClassName} data-slot="control-center-panel-role-mapping">
      <section
        aria-labelledby="control-center-role-ladder-steps-heading"
        className={panelSectionClassName}
      >
        <h3
          id="control-center-role-ladder-steps-heading"
          className={sectionHeadingClassName}
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
