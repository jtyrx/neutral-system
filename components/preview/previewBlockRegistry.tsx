import type {ComponentType} from 'react'

import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

import {BlockCaseWrapper} from '@/components/preview/BlockCaseWrapper'
import {ButtonVariantsBlock} from '@/components/preview/blocks/ButtonVariantsBlock'
import {CalloutBlock} from '@/components/preview/blocks/CalloutBlock'
import {ColorTokenInspectorBlock} from '@/components/preview/blocks/ColorTokenInspectorBlock'
import {DataCardBlock} from '@/components/preview/blocks/DataCardBlock'
import {FeedbackBlock} from '@/components/preview/blocks/FeedbackBlock'
import {FormControlsBlock} from '@/components/preview/blocks/FormControlsBlock'
import {FormFieldBlock} from '@/components/preview/blocks/FormFieldBlock'
import {LayoutNavBlock} from '@/components/preview/blocks/LayoutNavBlock'
import {OverlayMenuBlock} from '@/components/preview/blocks/OverlayMenuBlock'
import {SurfaceHierarchyBlock} from '@/components/preview/blocks/SurfaceHierarchyBlock'
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
  },
  {
    id: 'data-card',
    eyebrow: 'Data surface',
    title: 'Interactive data card',
    intent: 'Raised surface = lifted analytics tile. Focus ring uses the dedicated focus token — keyboard-first, not a default border.',
    Component: BlockCaseWrapper(DataCardBlock),
  },
  {
    id: 'form-field',
    eyebrow: 'Input',
    title: 'Form field',
    intent: 'Strong border = control boundary. Muted placeholder vs disabled read-only vs subtle help — distinct semantics.',
    Component: BlockCaseWrapper(FormFieldBlock),
  },
  {
    id: 'callout',
    eyebrow: 'Emphasis',
    title: 'Notification & brand callout',
    intent: 'Inverse strip = semantic ramp flip. Brand strip uses surface.brand with text.on for saturated-plane ink.',
    Component: BlockCaseWrapper(CalloutBlock),
  },
  {
    id: 'overlay-menu',
    eyebrow: 'Ephemeral surface',
    title: 'Action menu overlay',
    intent: 'Overlay = top elevation plane for ephemeral UI. Scrim dims the canvas; menu uses overlay + default border.',
    Component: BlockCaseWrapper(OverlayMenuBlock),
  },
  {
    id: 'button-variants',
    eyebrow: 'Interactive controls',
    title: 'Button variants',
    intent: 'All six variants × four sizes × four states (rest, focus ring, disabled, loading). Reveals how the neutral system sets fill, border, and ring for every button role.',
    Component: BlockCaseWrapper(ButtonVariantsBlock),
  },
  {
    id: 'form-controls',
    eyebrow: 'Input surfaces',
    title: 'Form controls',
    intent: 'Input default/disabled/invalid + Slider + ToggleGroup — exercises field border, focus ring, placeholder, and disabled opacity against the neutral surface.',
    Component: BlockCaseWrapper(FormControlsBlock),
  },
  {
    id: 'surface-hierarchy',
    eyebrow: 'Depth system',
    title: 'Surface hierarchy',
    intent: 'Four nested elevation planes (sunken → default → raised → overlay) demonstrating that each step of the neutral ladder produces legible depth.',
    Component: BlockCaseWrapper(SurfaceHierarchyBlock),
  },
  {
    id: 'color-token-inspector',
    eyebrow: 'Token reference',
    title: 'Color token inspector',
    intent: 'Clickable swatch grid for every surface, border, and text role. Hover to see the CSS variable name; click to open the inspector panel.',
    Component: BlockCaseWrapper(ColorTokenInspectorBlock),
  },
  {
    id: 'feedback',
    eyebrow: 'Status & state',
    title: 'Feedback states',
    intent: 'Skeleton skeleton, toast overlay, and badge group — exercises overlay surface, border, muted/disabled text, and inverse/brand planes in a single block.',
    Component: BlockCaseWrapper(FeedbackBlock),
  },
] satisfies PreviewBlockCase[]
