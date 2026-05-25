import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'feedback',
  entries: [
    {
      element: 'Block background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Toast plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Toast notifications float above the page at overlay elevation.',
    },
    {
      element: 'Toast border',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Toast title',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Toast body / Badge (subtle)',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Section label / Dismiss icon',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
    },
    {
      element: 'Badge (raised)',
      dtcgPath: 'color.surface.raised',
      cssVar: '--color-surface-raised',
      usage: 'background-color',
    },
    {
      element: 'Badge (inverse)',
      dtcgPath: 'color.surface.inverse',
      cssVar: '--color-surface-inverse',
      usage: 'background-color',
      description: 'High-contrast badge — inverse palette for solid emphasis.',
    },
    {
      element: 'Badge text on inverse / brand',
      dtcgPath: 'color.text.inverse',
      cssVar: '--color-text-inverse',
      usage: 'color',
      description: 'Guaranteed contrast on both inverse and brand surfaces.',
    },
  ],
}
