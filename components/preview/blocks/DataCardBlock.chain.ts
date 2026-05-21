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
      description: 'Primary text hierarchy — highest-contrast text tier, used for all leading labels.',
    },
    {
      element: 'Metric value',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
      description: 'Shares text.default with Heading — both are primary-reading-weight content.',
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
      description: 'Applied via the Button primitive\'s focus-visible outline, not a direct inline style. Semantically distinct from default border so keyboard state is never ambiguous.',
    },
  ],
}
