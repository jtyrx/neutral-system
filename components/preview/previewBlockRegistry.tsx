import type {ComponentType} from 'react'

import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

import {BlockCaseWrapper} from '@/components/preview/BlockCaseWrapper'
import {ButtonVariantsBlock} from '@/components/preview/blocks/ButtonVariantsBlock'
import {chainSpec as buttonVariantsChainSpec} from '@/components/preview/blocks/ButtonVariantsBlock.chain'
import {CalloutBlock} from '@/components/preview/blocks/CalloutBlock'
import {chainSpec as calloutChainSpec} from '@/components/preview/blocks/CalloutBlock.chain'
import {ColorTokenInspectorBlock} from '@/components/preview/blocks/ColorTokenInspectorBlock'
import {chainSpec as colorTokenInspectorChainSpec} from '@/components/preview/blocks/ColorTokenInspectorBlock.chain'
import {chainSpec as dataCardChainSpec} from '@/components/preview/blocks/DataCardBlock.chain'
import {DataCardBlock} from '@/components/preview/blocks/DataCardBlock'
import {FeedbackBlock} from '@/components/preview/blocks/FeedbackBlock'
import {chainSpec as feedbackChainSpec} from '@/components/preview/blocks/FeedbackBlock.chain'
import {FormControlsBlock} from '@/components/preview/blocks/FormControlsBlock'
import {chainSpec as formControlsChainSpec} from '@/components/preview/blocks/FormControlsBlock.chain'
import {FormFieldBlock} from '@/components/preview/blocks/FormFieldBlock'
import {chainSpec as formFieldChainSpec} from '@/components/preview/blocks/FormFieldBlock.chain'
import {LayoutNavBlock} from '@/components/preview/blocks/LayoutNavBlock'
import {chainSpec as layoutNavChainSpec} from '@/components/preview/blocks/LayoutNavBlock.chain'
import {OverlayMenuBlock} from '@/components/preview/blocks/OverlayMenuBlock'
import {chainSpec as overlayMenuChainSpec} from '@/components/preview/blocks/OverlayMenuBlock.chain'
import {SurfaceHierarchyBlock} from '@/components/preview/blocks/SurfaceHierarchyBlock'
import {chainSpec as surfaceHierarchyChainSpec} from '@/components/preview/blocks/SurfaceHierarchyBlock.chain'
import type {BlockCaseProps} from '@/components/preview/blockTypes'

export type {BlockCaseProps}

export type PreviewBlockCase = {
  id: string
  eyebrow: string
  title: string
  intent: string
  Component: ComponentType<BlockCaseProps>
  /** Token chain spec — required for new blocks; backfilled on existing blocks in Phase 2 */
  chainSpec?: BlockChainSpec
}

/**
 * Ordered list of block cases driving the semantic preview workbench.
 * Adding or removing a block is an edit to this array only.
 */
export const PREVIEW_BLOCK_CASES: PreviewBlockCase[] = [
  {
    id: 'layout-nav',
    eyebrow: 'Application shell',
    title: 'Layout & navigation',
    intent: 'Layered shell: recessed nav well, primary canvas, grouped workspace. Quiet nav vs active selection.',
    Component: BlockCaseWrapper(LayoutNavBlock),
    chainSpec: layoutNavChainSpec,
  },
  {
    id: 'data-card',
    eyebrow: 'Data surface',
    title: 'Interactive data card',
    intent: 'Raised surface = lifted analytics tile. Focus ring uses the dedicated focus token — keyboard-first, not a default border.',
    Component: BlockCaseWrapper(DataCardBlock),
    chainSpec: dataCardChainSpec,
  },
  {
    id: 'form-field',
    eyebrow: 'Input',
    title: 'Form field',
    intent: 'Strong border = control boundary. Muted placeholder vs disabled read-only vs subtle help — distinct semantics.',
    Component: BlockCaseWrapper(FormFieldBlock),
    chainSpec: formFieldChainSpec,
  },
  {
    id: 'callout',
    eyebrow: 'Emphasis',
    title: 'Notification & brand callout',
    intent: 'Inverse strip = semantic ramp flip. Brand strip uses surface.brand with text.on for saturated-plane ink.',
    Component: BlockCaseWrapper(CalloutBlock),
    chainSpec: calloutChainSpec,
  },
  {
    id: 'overlay-menu',
    eyebrow: 'Ephemeral surface',
    title: 'Action menu overlay',
    intent: 'Overlay = top elevation plane for ephemeral UI. Scrim dims the canvas; menu uses overlay + default border.',
    Component: BlockCaseWrapper(OverlayMenuBlock),
    chainSpec: overlayMenuChainSpec,
  },
  {
    id: 'button-variants',
    eyebrow: 'Interactive controls',
    title: 'Button variants',
    intent: 'All six variants × four sizes × four states (rest, focus ring, disabled, loading). Reveals how the neutral system sets fill, border, and ring for every button role.',
    Component: BlockCaseWrapper(ButtonVariantsBlock),
    chainSpec: buttonVariantsChainSpec,
  },
  {
    id: 'form-controls',
    eyebrow: 'Input surfaces',
    title: 'Form controls',
    intent: 'Input default/disabled/invalid + Slider + ToggleGroup — exercises field border, focus ring, placeholder, and disabled opacity against the neutral surface.',
    Component: BlockCaseWrapper(FormControlsBlock),
    chainSpec: formControlsChainSpec,
  },
  {
    id: 'surface-hierarchy',
    eyebrow: 'Depth system',
    title: 'Surface hierarchy',
    intent: 'Four nested elevation planes (sunken → default → raised → overlay) demonstrating that each step of the neutral ladder produces legible depth.',
    Component: BlockCaseWrapper(SurfaceHierarchyBlock),
    chainSpec: surfaceHierarchyChainSpec,
  },
  {
    id: 'color-token-inspector',
    eyebrow: 'Token reference',
    title: 'Color token inspector',
    intent: 'Clickable swatch grid for every surface, border, and text role. Hover to see the CSS variable name; click to open the inspector panel.',
    Component: BlockCaseWrapper(ColorTokenInspectorBlock),
    chainSpec: colorTokenInspectorChainSpec,
  },
  {
    id: 'feedback',
    eyebrow: 'Status & state',
    title: 'Feedback states',
    intent: 'Skeleton skeleton, toast overlay, and badge group — exercises overlay surface, border, muted/disabled text, and inverse/brand planes in a single block.',
    Component: BlockCaseWrapper(FeedbackBlock),
    chainSpec: feedbackChainSpec,
  },
] satisfies PreviewBlockCase[]
