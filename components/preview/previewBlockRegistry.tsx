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
import type {PreviewBlockSectionLayout} from '@/components/preview/previewBlockSectionLayout'
import {previewSectionLayouts} from '@/components/preview/previewBlockSectionLayout'

export type {BlockCaseProps}
export type {
  PreviewBlockSectionLayout,
  PreviewSectionAlign,
  PreviewSectionTier,
  PreviewSectionWidth,
} from '@/components/preview/previewBlockSectionLayout'
export {previewSectionLayouts}

export type PreviewBlockCase = {
  id: string
  eyebrow: string
  title: string
  intent: string
  Component: ComponentType<BlockCaseProps>
  /** Section tier, width, alignment, and comparison rhythm (see `previewSectionLayouts`). */
  sectionLayout: PreviewBlockSectionLayout
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
    intent: 'Recessed nav well, active selection, and workspace panel: operational shell density (Stripe/Linear), not analytics chrome.',
    Component: BlockCaseWrapper(LayoutNavBlock),
    sectionLayout: {...previewSectionLayouts.wide, sectionAlign: 'start'},
    chainSpec: layoutNavChainSpec,
  },
  {
    id: 'data-card',
    eyebrow: 'Card',
    title: 'Card specimens',
    intent: 'shadcn-style card header, content, footer, and compact settings card. Token mapping readout instead of hero metrics.',
    Component: BlockCaseWrapper(DataCardBlock),
    sectionLayout: {...previewSectionLayouts.standard, sectionAlign: 'start'},
    chainSpec: dataCardChainSpec,
  },
  {
    id: 'form-field',
    eyebrow: 'Input',
    title: 'Labeled field',
    intent: 'text.subtle labels, text.muted placeholders, border.strong on the active field, and read-only export values with text.disabled and border.default.',
    Component: BlockCaseWrapper(FormFieldBlock),
    sectionLayout: {...previewSectionLayouts.compact, sectionAlign: 'start'},
    chainSpec: formFieldChainSpec,
  },
  {
    id: 'callout',
    eyebrow: 'Emphasis',
    title: 'Inverse & brand callouts',
    intent: 'Inverse strip (surface/text.inverse) beside brand plane (surface.brand + text.brand) without decorative gradients.',
    Component: BlockCaseWrapper(CalloutBlock),
    sectionLayout: {...previewSectionLayouts.standard, sectionAlign: 'start'},
    chainSpec: calloutChainSpec,
  },
  {
    id: 'overlay-menu',
    eyebrow: 'Overlays',
    title: 'Popover, tooltip & menu',
    intent: 'Real Popover, Tooltip, and DropdownMenu on surface.overlay: ephemeral UI specimens aligned with shadcn blocks.',
    Component: BlockCaseWrapper(OverlayMenuBlock),
    sectionLayout: {...previewSectionLayouts.standard, sectionAlign: 'center'},
    chainSpec: overlayMenuChainSpec,
  },
  {
    id: 'button-variants',
    eyebrow: 'Button',
    title: 'Button matrix & group',
    intent: 'Variant × size matrix (rest, disabled, loading), tabbable focus ring row, and button groups. Native :focus-visible; token footnotes for fill and border.focus.',
    Component: BlockCaseWrapper(ButtonVariantsBlock),
    sectionLayout: {...previewSectionLayouts.canvas, sectionAlign: 'start'},
    chainSpec: buttonVariantsChainSpec,
  },
  {
    id: 'form-controls',
    eyebrow: 'Form controls',
    title: 'Input, tabs, radio & slider',
    intent: 'Input states, inline kbd shortcut, ToggleGroup tabs, RadioGroup segments, and slider (shadcn input/tabs/radio-group/kbd patterns).',
    Component: BlockCaseWrapper(FormControlsBlock),
    sectionLayout: {
      ...previewSectionLayouts.standard,
      sectionWidth: 'lg',
      sectionAlign: 'start',
    },
    chainSpec: formControlsChainSpec,
  },
  {
    id: 'surface-hierarchy',
    eyebrow: 'Surfaces',
    title: 'Elevation ladder',
    intent: 'Flat stacked planes (sunken → overlay) with role annotations: tweakcn-style theme preview without nested card clutter.',
    Component: BlockCaseWrapper(SurfaceHierarchyBlock),
    sectionLayout: {...previewSectionLayouts.wide, sectionAlign: 'start'},
    chainSpec: surfaceHierarchyChainSpec,
  },
  {
    id: 'color-token-inspector',
    eyebrow: 'Tokens',
    title: 'Semantic swatch grid',
    intent: 'Per-layer swatch specimens with tooltips: inspectable token logic like Figma variables / tweakcn theme editor.',
    Component: BlockCaseWrapper(ColorTokenInspectorBlock),
    sectionLayout: {...previewSectionLayouts.canvas, sectionAlign: 'start'},
    chainSpec: colorTokenInspectorChainSpec,
  },
  {
    id: 'feedback',
    eyebrow: 'Status',
    title: 'Badge, skeleton & toast',
    intent: 'Badge variant row, skeleton loading, and toast on overlay (shadcn badge + skeleton blocks).',
    Component: BlockCaseWrapper(FeedbackBlock),
    sectionLayout: {...previewSectionLayouts.standard, sectionAlign: 'start'},
    chainSpec: feedbackChainSpec,
  },
] satisfies PreviewBlockCase[]
