import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'data-card',
  entries: [
    {
      element: 'Card surface',
      dtcgPath: 'color.surface.raised',
      cssVar: '--color-surface-raised',
      usage: 'background-color',
      description: 'Raised elevation plane — one step above the default canvas to visually lift the analytics tile.',
    },
    {
      element: 'Card edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Heading',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Metric value',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Timestamp',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Muted — secondary metadata that should recede visually behind the primary metric.',
    },
    {
      element: 'Focus ring',
      dtcgPath: 'color.border.focus',
      cssVar: '--color-border-focus',
      usage: 'outline-color',
      description: 'Dedicated focus token — semantically distinct from default border so keyboard state is never ambiguous.',
    },
  ],
}
