'use client'

import {memo, useMemo} from 'react'

import {useControlCenterPanelContext} from '@/components/control-center/ControlCenterPanelContext'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  clampGlobalScaleSteps,
  GLOBAL_SCALE_STEP_MAX,
  GLOBAL_SCALE_STEP_MIN,
} from '@/lib/neutral-engine/globalScale'

const panelInsetClassName = 'px-1 pb-1'
const cardClassName =
  'rounded-xl border border-[color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)] bg-[color-mix(in_oklch,var(--muted)_20%,transparent)] px-4 py-3 shadow-sm'
const cardTitleClassName =
  'text-[0.8125rem] leading-[1.3] tracking-normal text-foreground'
const stepsRowClassName =
  'flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6'
const stepsDescClassName =
  'mt-1 max-w-md text-[0.7rem] leading-[1.375] text-muted-foreground'
const stepsValueClassName =
  'flex shrink-0 items-center justify-end gap-2 self-end sm:self-center'
const stepsLabelClassName =
  'text-xs leading-4 text-muted-foreground tabular-nums'
const stepsValueClusterClassName =
  'flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-none sm:items-end'
const stepsValueRowClassName =
  'flex w-full min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:w-auto sm:flex-nowrap'
const stepsValuePairClassName = 'flex items-center gap-2'
const stepsDividerClassName =
  'hidden h-8 w-px shrink-0 bg-[color-mix(in_oklch,var(--border)_90%,transparent)] sm:block'

const stepOptions: number[] = Array.from(
  {length: GLOBAL_SCALE_STEP_MAX - GLOBAL_SCALE_STEP_MIN + 1},
  (_, i) => GLOBAL_SCALE_STEP_MIN + i,
)

type RampStepsSelectProps = {
  id: string
  ariaLabel: string
  steps: number
  onCommit: (next: number) => void
}

function RampStepsSelect({
  id,
  ariaLabel,
  steps,
  onCommit,
}: RampStepsSelectProps) {
  const v = clampGlobalScaleSteps(steps)
  return (
    <Select
      id={id}
      value={String(v)}
      onValueChange={(val) => {
        if (typeof val !== 'string' || val === '') return
        onCommit(clampGlobalScaleSteps(Number(val)))
      }}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel}>
        <SelectValue>
          {(val: string | null | undefined) =>
            val != null && String(val) !== '' ? String(val) : '—'
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        sideOffset={8}
        style={{maxHeight: 'calc(2.375rem * 9)'}}
      >
        {stepOptions.map((n) => (
          <SelectItem key={n} value={String(n)}>
            <span className="font-mono">{String(n)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StepsPanelInner() {
  const {
    neutralArchitecture,
    globalScale,
    lightScale,
    darkScale,
    patchGlobal,
    patchLight,
    patchDark,
  } = useNeutralWorkbenchContext()

  const {effectiveRampContext} = useControlCenterPanelContext()

  const globalSteps = useMemo(
    () => clampGlobalScaleSteps(globalScale.steps),
    [globalScale.steps],
  )
  const lightSteps = useMemo(
    () => clampGlobalScaleSteps(lightScale.steps),
    [lightScale.steps],
  )
  const darkSteps = useMemo(
    () => clampGlobalScaleSteps(darkScale.steps),
    [darkScale.steps],
  )

  if (neutralArchitecture === 'simple') {
    return (
      <div className={panelInsetClassName} data-slot="dock-picker-steps-simple">
        <div className={cardClassName}>
          <div className={stepsRowClassName}>
            <div className="min-w-0 flex-1">
              <p className={cardTitleClassName}>Color Scale</p>
              <p className={stepsDescClassName}>
                One ladder length drives both light and dark theme ramps.
              </p>
            </div>
            <div className={stepsValueClassName}>
              <RampStepsSelect
                id="dock-picker-steps-global"
                ariaLabel="Neutral scale step count"
                steps={globalSteps}
                onCommit={(next) => patchGlobal('steps', next, 'Steps')}
              />
              <span className={stepsLabelClassName}>steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (effectiveRampContext === 'light') {
    return (
      <div className={panelInsetClassName} data-slot="dock-picker-steps-light">
        <div className={cardClassName}>
          <div className={stepsRowClassName}>
            <div className="min-w-0 flex-1">
              <p className={cardTitleClassName}>Color Scale (light ramp)</p>
              <p className={stepsDescClassName}>
                Tier-1 stop count on the light global ramp.
              </p>
            </div>
            <div className={stepsValueClassName}>
              <RampStepsSelect
                id="dock-picker-steps-light"
                ariaLabel="Light ramp step count"
                steps={lightSteps}
                onCommit={(next) =>
                  patchLight('steps', next, 'Light ramp steps')
                }
              />
              <span className={stepsLabelClassName}>steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (effectiveRampContext === 'dark') {
    return (
      <div className={panelInsetClassName} data-slot="dock-picker-steps-dark">
        <div className={cardClassName}>
          <div className={stepsRowClassName}>
            <div className="min-w-0 flex-1">
              <p className={cardTitleClassName}>Color Scale (dark ramp)</p>
              <p className={stepsDescClassName}>
                Tier-1 stop count on the dark elevated ramp.
              </p>
            </div>
            <div className={stepsValueClassName}>
              <RampStepsSelect
                id="dock-picker-steps-dark"
                ariaLabel="Dark elevated ramp step count"
                steps={darkSteps}
                onCommit={(next) =>
                  patchDark('steps', next, 'Dark elevated steps')
                }
              />
              <span className={stepsLabelClassName}>steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={panelInsetClassName} data-slot="dock-picker-steps-advanced">
      <div className={cardClassName}>
        <div className={stepsRowClassName}>
          <div className="min-w-0 flex-1">
            <p className={cardTitleClassName}>Color Scale (ramp)</p>
            <p className={stepsDescClassName}>
              Number of tier-1 stops on each global ramp (low index is lightest
              on the light ramp).
            </p>
          </div>
          <div
            className={stepsValueClusterClassName}
            data-slot="dock-picker-steps-light-dark-cluster"
          >
            <div className={stepsValueRowClassName}>
              <div className={stepsValuePairClassName}>
                <RampStepsSelect
                  id="dock-picker-steps-light"
                  ariaLabel="Light ramp step count"
                  steps={lightSteps}
                  onCommit={(next) =>
                    patchLight('steps', next, 'Light ramp steps')
                  }
                />
                <span className={stepsLabelClassName}>steps</span>
              </div>
              <div className={stepsDividerClassName} aria-hidden />
              <div className={stepsValuePairClassName}>
                <RampStepsSelect
                  id="dock-picker-steps-dark"
                  ariaLabel="Dark elevated ramp step count"
                  steps={darkSteps}
                  onCommit={(next) =>
                    patchDark('steps', next, 'Dark elevated steps')
                  }
                />
                <span className={stepsLabelClassName}>steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const StepsPanel = memo(StepsPanelInner)
