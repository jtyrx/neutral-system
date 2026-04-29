/**
 * Single source for workbench `--ns-*` → tier-2 `--color-*` (semantic role) wiring
 * inside `exportCssVariables` (`exportFormats.ts`). Keeps live `[data-theme]` chrome in sync with
 * `app/globals.css` `@theme inline` expectations.
 *
 * Policy for roles with no 1:1 engine name:
 * - `--ns-border-brand` → `border.strong` (emphasized stroke on brand chrome)
 * - `--ns-border-inverse` → `border.focus` (high-contrast, pairs with inverse surfaces)
 * - `--ns-border-scrim` / `--ns-border-overlay-scrim` → subtle / default borders on overlays
 * - `--ns-text-brand` → `text.on` (copy on saturated / brand planes)
 * - `--ns-text-scrim` / `--ns-text-overlay-scrim` → `text.default` (body on dimmed layers)
 */

/** Dots → hyphens: `surface.default` → `surface-default` (must match `tokenCssVarName` in `exportFormats.ts`). */
function tier2ColorVarName(role: string): string {
  return `color-${role.replace(/\./g, '-')}`
}

export type ChromeNsRolePeer = {
  ns: `--${string}`
  /** Engine semantic role id (e.g. `surface.default`). */
  role: string
}

/** Role-backed aliases: emitted as `${ns}: var(--${semanticColorVarName(role)});` */
export const NS_CHROME_ROLE_PEERS: readonly ChromeNsRolePeer[] = [
  {ns: '--ns-app-bg', role: 'surface.sunken'},
  {ns: '--ns-surface', role: 'surface.default'},
  {ns: '--ns-surface-sunken', role: 'surface.sunken'},
  {ns: '--ns-surface-default', role: 'surface.default'},
  {ns: '--ns-surface-subtle', role: 'surface.subtle'},
  {ns: '--ns-surface-raised', role: 'surface.raised'},
  {ns: '--ns-surface-overlay', role: 'surface.overlay'},
  {ns: '--ns-surface-inverse', role: 'surface.inverse'},
  {ns: '--ns-surface-brand', role: 'surface.brand'},
  {ns: '--ns-border-subtle', role: 'border.subtle'},
  {ns: '--ns-border-default', role: 'border.default'},
  {ns: '--ns-border-strong', role: 'border.strong'},
  {ns: '--ns-border-focus', role: 'border.focus'},
  {ns: '--ns-border-brand', role: 'border.strong'},
  {ns: '--ns-border-inverse', role: 'border.focus'},
  {ns: '--ns-border-scrim', role: 'border.subtle'},
  {ns: '--ns-border-overlay-scrim', role: 'border.default'},
  {ns: '--ns-text', role: 'text.default'},
  {ns: '--ns-text-default', role: 'text.default'},
  {ns: '--ns-text-subtle', role: 'text.subtle'},
  {ns: '--ns-text-muted', role: 'text.muted'},
  {ns: '--ns-text-faint', role: 'text.disabled'},
  {ns: '--ns-text-disabled', role: 'text.disabled'},
  {ns: '--ns-text-on', role: 'text.on'},
  {ns: '--ns-text-brand', role: 'text.on'},
  {ns: '--ns-text-scrim', role: 'text.default'},
  {ns: '--ns-text-overlay-scrim', role: 'text.default'},
  {ns: '--ns-accent', role: 'surface.brand'},
  {ns: '--ns-scrim', role: 'overlay.scrim'},
  {ns: '--ns-overlay-scrim', role: 'overlay.scrim'},
]

/**
 * Static lines (color-mix and derived aliases) appended after role peers.
 * `var(--ns-text)` must resolve first — keep peers that define `--ns-text` above these.
 */
export const NS_CHROME_STATIC_LINES: readonly string[] = [
  '  --ns-hairline: color-mix(in oklch, var(--ns-text) 10%, transparent);',
  '  --ns-hairline-strong: color-mix(in oklch, var(--ns-text) 18%, transparent);',
  '  --ns-chip: color-mix(in oklch, var(--ns-text) 6%, transparent);',
  '  --ns-field: color-mix(in oklch, var(--ns-text) 4%, transparent);',
  '  --ns-overlay-soft: color-mix(in oklch, var(--ns-text) 3%, transparent);',
  '  --ns-overlay-strong: color-mix(in oklch, var(--ns-text) 15%, transparent);',
]

export function linesLiveThemeNsChromeBlock(): string[] {
  const roleLines = NS_CHROME_ROLE_PEERS.map(
    ({ns, role}) => `  ${ns}: var(--${tier2ColorVarName(role)});`,
  )
  return [...roleLines, ...NS_CHROME_STATIC_LINES]
}
