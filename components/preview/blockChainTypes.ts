export type ChainEntry = {
  /** Human-readable element label shown in the drawer. E.g. "Card surface" */
  element: string
  /** Full DTCG token path. E.g. "color.surface.raised" */
  dtcgPath: string
  /** CSS custom property name. E.g. "--color-surface-raised" */
  cssVar: string
  /** CSS property this token is applied to. E.g. "background-color" */
  usage: string
  /** Optional DS rationale shown as subtext in the drawer */
  description?: string
}

export type BlockChainSpec = {
  /** Must match PreviewBlockCase.id */
  blockId: string
  entries: ChainEntry[]
}
