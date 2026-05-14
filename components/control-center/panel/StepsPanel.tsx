'use client'

import {memo, useMemo} from 'react'

import {useControlCenterPanelContext} from '@/components/control-center/ControlCenterPanelContext'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <div className="cc-panel-inset" data-slot="dock-picker-steps-simple">
        <div className="cc-card">
          <div className="cc-steps-row">
            <div className="min-w-0 flex-1">
              <p className="cc-card-title">Color Scale</p>
              <p className="cc-steps-desc">
                One ladder length drives both light and dark theme ramps.
              </p>
            </div>
            <div className="cc-steps-value">
              <RampStepsSelect
                id="dock-picker-steps-global"
                ariaLabel="Neutral scale step count"
                steps={globalSteps}
                onCommit={(next) => patchGlobal('steps', next, 'Steps')}
              />
              <span className="cc-steps-label">steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (effectiveRampContext === 'light') {
    return (
      <div className="cc-panel-inset" data-slot="dock-picker-steps-light">
        <div className="cc-card">
          <div className="cc-steps-row">
            <div className="min-w-0 flex-1">
              <p className="cc-card-title">Color Scale (light ramp)</p>
              <p className="cc-steps-desc">
                Tier-1 stop count on the light global ramp.
              </p>
            </div>
            <div className="cc-steps-value">
              <RampStepsSelect
                id="dock-picker-steps-light"
                ariaLabel="Light ramp step count"
                steps={lightSteps}
                onCommit={(next) =>
                  patchLight('steps', next, 'Light ramp steps')
                }
              />
              <span className="cc-steps-label">steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (effectiveRampContext === 'dark') {
    return (
      <div className="cc-panel-inset" data-slot="dock-picker-steps-dark">
        {/* <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card> */}
        <div className="cc-card">
          <div className="cc-steps-row">
            <div className="min-w-0 flex-1">
              <p className="cc-card-title">Color Scale (dark ramp)</p>
              <p className="cc-steps-desc">
                Tier-1 stop count on the dark elevated ramp.
              </p>
            </div>
            <div className="cc-steps-value">
              <RampStepsSelect
                id="dock-picker-steps-dark"
                ariaLabel="Dark elevated ramp step count"
                steps={darkSteps}
                onCommit={(next) =>
                  patchDark('steps', next, 'Dark elevated steps')
                }
              />
              <span className="cc-steps-label">steps</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cc-panel-inset" data-slot="dock-picker-steps-advanced">
      <div className="cc-card">
        <div className="cc-steps-row">
          <div className="min-w-0 flex-1">
            <p className="cc-card-title">Color Scale (ramp)</p>
            <p className="cc-steps-desc">
              Number of tier-1 stops on each global ramp (low index is lightest
              on the light ramp).
            </p>
          </div>
          <div
            className="cc-steps-value-cluster"
            data-slot="dock-picker-steps-light-dark-cluster"
          >
            <div className="cc-steps-value-row">
              <div className="cc-steps-value-pair">
                <RampStepsSelect
                  id="dock-picker-steps-light"
                  ariaLabel="Light ramp step count"
                  steps={lightSteps}
                  onCommit={(next) =>
                    patchLight('steps', next, 'Light ramp steps')
                  }
                />
                <span className="cc-steps-label">steps</span>
              </div>
              <div className="cc-steps-divider" aria-hidden />
              <div className="cc-steps-value-pair">
                <RampStepsSelect
                  id="dock-picker-steps-dark"
                  ariaLabel="Dark elevated ramp step count"
                  steps={darkSteps}
                  onCommit={(next) =>
                    patchDark('steps', next, 'Dark elevated steps')
                  }
                />
                <span className="cc-steps-label">steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const StepsPanel = memo(StepsPanelInner)
