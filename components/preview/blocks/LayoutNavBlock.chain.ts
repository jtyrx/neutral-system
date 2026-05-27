import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'layout-nav',
  entries: [
    {
      element: 'Page canvas',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Default surface — used for the outer container and active nav row.',
    },
    {
      element: 'Sidebar well',
      dtcgPath: 'color.surface.sunken',
      cssVar: '--color-surface-sunken',
      usage: 'background-color',
      description: 'Recessed surface for the sidebar — one step below default.',
    },
    {
      element: 'Panel',
      dtcgPath: 'color.surface.subtle',
      cssVar: '--color-surface-subtle',
      usage: 'background-color',
      description: 'Subtle surface for content panels — between default and sunken.',
    },
    {
      element: 'Dividers',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Low-emphasis borders for structural dividers that recede behind content.',
    },
    {
      element: 'Primary text',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
      description: 'Default text — headings, active nav labels, workspace content.',
    },
    {
      element: 'Secondary text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
      description: 'Inactive nav labels and supporting body copy.',
    },
    {
      element: 'Section label',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Tertiary text — navigation section heading at minimal emphasis.',
    },
  ],
}
