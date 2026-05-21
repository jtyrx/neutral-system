'use client'

import {memo, useMemo} from 'react'
import dynamic from 'next/dynamic'

import {Blend, Braces, Map, Paintbrush, Palette, Route} from 'lucide-react'

import {BrandColorSection} from '@/components/sections/BrandColorSection'
import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSection} from '@/components/sections/OkhslSection'
import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
import {ThemePanelsSection} from '@/components/sections/ThemePanelsSection'
import {VariantsSection} from '@/components/sections/VariantsSection'
import {OklchPickerPanel} from '@/components/picker/OklchPickerPanel'
import {PillButton, PillChip} from '@/components/ui/chip.tsx'
import {
  CollapsibleControlGroup,
  type CollapsibleControlGroupIcon,
} from '@/components/workbench/CollapsibleControlGroup'
import {
  DEFAULT_GLOBAL,
  type NeutralWorkbench,
} from '@/hooks/useNeutralWorkbench'
import {useOklchPickerWorkbench} from '@/hooks/useOklchPickerWorkbench'
import {sandboxWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

type ArchitectureMode = NeutralWorkbench['neutralArchitecture']
type RampEditTarget = Extract<
  NeutralWorkbench['scaleEditTarget'],
  'light' | 'dark'
>

type BranchText = Record<ArchitectureMode, string>

type ControlGroupContent = {
  id: string
  icon: CollapsibleControlGroupIcon
  title: string
  defaultOpen: boolean
  description?: string
}

type ChoiceContent<T extends string> = Record<T, {label: string}>

type ScaleContent = Omit<ControlGroupContent, 'title'> & {
  title: BranchText
  summary: BranchText
  architecture: {
    title: string
    description: string
    choices: ChoiceContent<ArchitectureMode>
  }
  editTarget: {
    title: string
    description: string
    choices: ChoiceContent<RampEditTarget>
  }
  okhsl: {
    id: string
    title: string
    description: string
    resetLabel: string
    resetHistoryLabel: string
    toggle: {
      show: string
      hide: string
    }
  }
}

type PickerContent = ControlGroupContent & {
  descriptionPrefix: string
  actionLabel: string
  descriptionSuffix: string
}

type MappingContent = ControlGroupContent & {
  alpha: {
    title: string
    descriptionPrefix: string
    anchorToken: string
    descriptionSuffix: string
    lightOffsetLabel: string
    darkOffsetLabel: string
  }
}

type BuilderControlsContent = {
  scale: ScaleContent
  picker: PickerContent
  brand: ControlGroupContent
  mapping: MappingContent
  inspect: ControlGroupContent
  export: ControlGroupContent
}

const BUILDER_CONTROLS_CONTENT = {
  scale: {
    id: 'neutral-workbench-controls-scale',
    icon: Blend,
    title: {
      simple: 'Global neutral scale ladder',
      advanced: 'Neutral scale ladders',
    },
    summary: {
      simple: 'Steps, lightness range, chroma shaping, and hue variants.',
      advanced:
        'Independent light / dark ramps — pick which ladder you edit, then tweak steps and chroma.',
    },
    defaultOpen: true,
    architecture: {
      title: 'Architecture',
      description:
        'Simple mirrors one ramp into both themes by mapping. Advanced keeps independent ramps for optics.',
      choices: {
        simple: {label: 'Simple · single ladder'},
        advanced: {label: 'Advanced · sibling ramps'},
      },
    },
    editTarget: {
      title: 'Edit target ramp',
      description:
        'Hue variants and OKHSL commits apply here. Inspect the other ramp visually in previews.',
      choices: {
        light: {label: 'Light ramp'},
        dark: {label: 'Dark elevated ramp'},
      },
    },
    okhsl: {
      id: 'nsb-workbench-controls-okhsl',
      title: 'OKHSL authoring overlay',
      description:
        'Edit via gamut-relative coordinates. Commits back to OKLCH config.',
      resetLabel: 'Reset',
      resetHistoryLabel: 'OKHSL · Reset',
      toggle: {
        show: 'Show OKHSL',
        hide: 'Hide OKHSL',
      },
    },
  },
  picker: {
    id: 'workbench-oklch-picker',
    icon: Palette,
    title: 'OKLCH picker (parallel)',
    defaultOpen: false,
    descriptionPrefix:
      'Gamut-aware L / C / H exploration on a separate engine config. Use',
    actionLabel: 'Apply to global scale',
    descriptionSuffix:
      'to copy the resulting ramp into Simple mode (single ladder).',
  },
  brand: {
    id: 'workbench-custom-brand',
    icon: Paintbrush,
    title: 'Custom brand',
    description:
      'Brand input (OKLCH / Hex / RGB / Display-P3) — synced with preview, exports, and the Color.js picker.',
    defaultOpen: false,
  },
  mapping: {
    id: 'workbench-mapping',
    icon: Map,
    title: 'Contrast & role mapping',
    description:
      'Contrast distance, step intervals, starts, and token counts per role ladder.',
    defaultOpen: false,
    alpha: {
      title: 'Alpha neutral base offset',
      descriptionPrefix: 'Nudge the alpha token anchor from',
      anchorToken: 'text.default',
      descriptionSuffix: 'resolved index.',
      lightOffsetLabel: 'Light offset',
      darkOffsetLabel: 'Dark offset',
    },
  },
  inspect: {
    id: 'workbench-inspect',
    icon: Route,
    title: 'Inspect & paired views',
    description: 'Theme panels, ramp usage, and role tables.',
    defaultOpen: false,
  },
  export: {
    id: 'export',
    icon: Braces,
    title: 'Export',
    defaultOpen: false,
  },
} satisfies BuilderControlsContent

const ExportSection = dynamic(
  () =>
    import('@/components/sections/ExportSection').then((m) => ({
      default: m.ExportSection,
    })),
  {ssr: false, loading: () => null},
)

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Grouped controls: Scale → Mapping → Inspect → Export. */
function BuilderControlsSectionsInner({wb, selectedGlobalIndex}: Props) {
  const simpleArch = wb.neutralArchitecture === 'simple'
  const sandboxPicker = useOklchPickerWorkbench()
  const sandboxAdapter = useMemo(
    () => sandboxWorkbenchAdapter(sandboxPicker),
    [sandboxPicker],
  )
  const content = BUILDER_CONTROLS_CONTENT
  const architectureMode: ArchitectureMode = simpleArch
    ? 'simple'
    : 'advanced'

  const activeRampVisual = simpleArch
    ? wb.global
    : wb.scaleEditTarget === 'dark'
      ? wb.darkRamp
      : wb.lightRamp
  return (
    <div className="flex flex-col gap-16 pb-48">
      <CollapsibleControlGroup
        id={content.scale.id}
        icon={content.scale.icon}
        title={content.scale.title[architectureMode]}
        defaultOpen={content.scale.defaultOpen}
      >
        <div className="space-y-16">
          <div>
            <div className="mt-4 space-y-8 text-xs text-muted">
              {content.scale.summary[architectureMode]}
            </div>
            <p className="text-xs font-medium text-default">
              {content.scale.architecture.title}
            </p>
            <p className="mt-4 text-micro text-muted">
              {content.scale.architecture.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <PillChip
                selected={simpleArch}
                tone="amber"
                activeStyle="pill"
                onClick={() => wb.setNeutralArchitecture('simple')}
              >
                {content.scale.architecture.choices.simple.label}
              </PillChip>
              <PillChip
                selected={!simpleArch}
                tone="sky"
                activeStyle="pill"
                onClick={() => wb.setNeutralArchitecture('advanced')}
              >
                {content.scale.architecture.choices.advanced.label}
              </PillChip>
            </div>
          </div>

          {!simpleArch ? (
            <div>
              <p className="text-xs font-medium text-default">
                {content.scale.editTarget.title}
              </p>
              <p className="mt-4 text-micro text-muted">
                {content.scale.editTarget.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                <PillChip
                  selected={wb.scaleEditTarget === 'light'}
                  tone="amber"
                  activeStyle="surface-soft"
                  onClick={() => wb.setScaleEditTarget('light')}
                >
                  {content.scale.editTarget.choices.light.label}
                </PillChip>
                <PillChip
                  selected={wb.scaleEditTarget === 'dark'}
                  tone="sky"
                  activeStyle="surface-soft"
                  onClick={() => wb.setScaleEditTarget('dark')}
                >
                  {content.scale.editTarget.choices.dark.label}
                </PillChip>
              </div>
            </div>
          ) : null}
        </div>

        <GlobalScaleSection
          architecture={wb.neutralArchitecture}
          comparisonConfig={wb.globalScale}
          lightRampConfig={simpleArch ? wb.globalScale : wb.lightScale}
          patchLightRamp={simpleArch ? wb.patchGlobal : wb.patchLight}
          darkRampConfig={simpleArch ? wb.globalScale : wb.darkScale}
          patchDarkRamp={simpleArch ? wb.patchGlobal : wb.patchDark}
          global={activeRampVisual}
          selectedIndex={selectedGlobalIndex}
          onSelectSwatch={wb.selectGlobal}
        />

        <div
          id={content.scale.okhsl.id}
          className="mt-24 border-hairline pt-24"
        >
          <div className="flex items-center justify-between gap-12">
            <div>
              <p className="text-xs font-medium text-default">
                {content.scale.okhsl.title}
              </p>
              <p className="text-xs text-muted">
                {content.scale.okhsl.description}
              </p>
            </div>
            <div className="flex items-center gap-8">
              {wb.okhslEnabled ? (
                <PillButton
                  type="button"
                  onClick={() =>
                    wb.setScaleConfigPreset(
                      (cfg) => ({
                        ...cfg,
                        hue: DEFAULT_GLOBAL.hue,
                        lHigh: DEFAULT_GLOBAL.lHigh,
                        lLow: DEFAULT_GLOBAL.lLow,
                        baseChroma: DEFAULT_GLOBAL.baseChroma,
                      }),
                      content.scale.okhsl.resetHistoryLabel,
                    )
                  }
                >
                  {content.scale.okhsl.resetLabel}
                </PillButton>
              ) : null}
              <PillButton
                id="nsb-workbench-controls-okhsl-toggle"
                type="button"
                onClick={() => wb.setOkhslEnabled((v) => !v)}
                aria-expanded={wb.okhslEnabled}
              >
                {wb.okhslEnabled
                  ? content.scale.okhsl.toggle.hide
                  : content.scale.okhsl.toggle.show}
              </PillButton>
            </div>
          </div>
          {wb.okhslEnabled ? (
            <div className="mt-16">
              <OkhslSection
                view={wb.okhslView}
                resolvedConfig={{
                  hue: wb.okhslEditableConfig.hue,
                  baseChroma: wb.okhslEditableConfig.baseChroma,
                  lHigh: wb.okhslEditableConfig.lHigh,
                  lLow: wb.okhslEditableConfig.lLow,
                }}
                onEdit={(edit, label) =>
                  wb.setGlobalConfigFromOkhsl(edit, label)
                }
              />
            </div>
          ) : null}
        </div>
        <div className="mt-24">
          {/*
            Passing `setScaleConfigPreset` keeps commits on the active edit target (Simple: global ramp;
            Advanced: light vs dark sibling) so `memo(VariantsSection)` stays stable when only the target swaps.
          */}
          <VariantsSection
            config={wb.okhslEditableConfig}
            onChange={wb.setScaleConfigPreset}
          />
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id={content.picker.id}
        icon={content.picker.icon}
        title={content.picker.title}
        defaultOpen={content.picker.defaultOpen}
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
          {content.picker.descriptionPrefix}{' '}
          <span className="font-medium text-default">
            {content.picker.actionLabel}
          </span>{' '}
          {content.picker.descriptionSuffix}
        </div>
        <div className="mt-16">
          <OklchPickerPanel variant="embedded" adapter={sandboxAdapter} />
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id={content.brand.id}
        icon={content.brand.icon}
        title={content.brand.title}
        defaultOpen={content.brand.defaultOpen}
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
          {content.brand.description}
        </div>
        <BrandColorSection
          systemConfig={wb.systemConfig}
          patchSystem={wb.patchSystem}
        />
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id={content.mapping.id}
        icon={content.mapping.icon}
        title={content.mapping.title}
        defaultOpen={content.mapping.defaultOpen}
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
          {content.mapping.description}
        </div>
        <SystemMappingSection
          config={wb.systemConfig}
          derivationLight={wb.effectiveMappingLight}
          derivationDark={wb.effectiveMappingDark}
          contrastEmphasis={wb.contrastEmphasis}
          patchSystem={wb.patchSystem}
          stepsLight={wb.ladderLightSteps}
          stepsDark={wb.ladderDarkSteps}
          alphaBaseIndices={wb.alphaBaseIndices}
        />
        <div className="mt-24 space-y-12 border-hairline pt-24">
          <div>
            <p className="text-xs font-medium text-default">
              {content.mapping.alpha.title}
            </p>
            <p className="text-xs text-muted">
              {content.mapping.alpha.descriptionPrefix}{' '}
              <code className="font-mono">
                {content.mapping.alpha.anchorToken}
              </code>{' '}
              {content.mapping.alpha.descriptionSuffix} Light base:{' '}
              {wb.alphaBaseIndices.lightBase} · Dark base:{' '}
              {wb.alphaBaseIndices.darkBase}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <label className="flex flex-col gap-4">
              <span className="text-xs text-muted">
                {content.mapping.alpha.lightOffsetLabel}
              </span>
              <input
                type="number"
                min={-10}
                max={10}
                value={wb.alphaConfig.lightIndexOffset}
                onChange={(e) =>
                  wb.setAlphaConfig((prev) => ({
                    ...prev,
                    lightIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-field px-8 py-4 text-right font-mono text-xs"
              />
            </label>
            <label className="flex flex-col gap-4">
              <span className="text-xs text-muted">
                {content.mapping.alpha.darkOffsetLabel}
              </span>
              <input
                type="number"
                min={-10}
                max={10}
                value={wb.alphaConfig.darkIndexOffset}
                onChange={(e) =>
                  wb.setAlphaConfig((prev) => ({
                    ...prev,
                    darkIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-field px-8 py-4 text-right font-mono text-xs"
              />
            </label>
          </div>
        </div>
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id={content.inspect.id}
        icon={content.inspect.icon}
        title={content.inspect.title}
        defaultOpen={content.inspect.defaultOpen}
      >
        <div className="mt-4 space-y-8 text-xs text-muted">
          {content.inspect.description}
        </div>
        <ThemePanelsSection
          globalLight={wb.lightRamp}
          globalDark={wb.darkRamp}
          lightTokenView={wb.lightTokenView}
          darkTokenView={wb.darkTokenView}
          onSelectSystem={wb.selectSystem}
        />
      </CollapsibleControlGroup>

      <CollapsibleControlGroup
        id={content.export.id}
        icon={content.export.icon}
        title={content.export.title}
        defaultOpen={content.export.defaultOpen}
      >
        <ExportSection
          architecture={wb.neutralArchitecture}
          architectureRamps={wb.architectureRamps}
          globalScale={wb.globalScale}
          lightScale={wb.lightScale}
          darkScale={wb.darkScale}
          systemConfig={wb.systemConfig}
          lightTokens={wb.lightTokens}
          darkTokens={wb.darkTokens}
          alphaConfig={wb.alphaConfig}
        />
      </CollapsibleControlGroup>
    </div>
  )
}

export const BuilderControlsSections = memo(BuilderControlsSectionsInner)
