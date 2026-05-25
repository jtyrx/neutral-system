# Preview Block Token Chain — Phase 1 Design Spec

**Date:** 2026-05-20
**Status:** Approved
**Scope:** Phase 1 of 3

---

## Problem

The preview block system renders 10 component pattern blocks (cards, forms, navigation, etc.) using
inline `style` attributes fed by a JS-resolved `c.*` prop object. This approach:

- Prevents Tailwind `dark:` utilities from working inside blocks
- Requires every new block to map roles manually in `ResolvedBlockColors`
- Provides no visible token chain — a viewer cannot trace which primitive step drives which
  component surface
- Has no DTCG-compliant data model, blocking future Style Dictionary and Storybook integration

With 10 more blocks planned (forms, CTAs, hero sections, checkout flows), these problems compound.

---

## Goals

1. **CSS variable inheritance** — blocks read semantic tokens from CSS custom properties via a
   `data-preview-theme` ancestor scope, not from JS-resolved inline styles
2. **DTCG token model** — `SystemToken` carries `$type` and `$description`; semantic `$value`
   references use DTCG alias syntax (`{color.neutral.6}`)
3. **Token chain data** — each block declares a typed `BlockChainSpec` colocated as a `.chain.ts`
   file; this is structured data, not UI
4. **Token chain drawer** — a single live drawer surfaces any block's chain on demand, updating in
   real time as the workbench scale changes
5. **Portfolio-grade DS architecture** — the system demonstrates the full primitive → semantic →
   component traceability expected in production design systems

---

## Non-Goals (Phase 2 / 3)

- Migrating existing 10 blocks to CSS var inheritance (Phase 2)
- Adding `.chain.ts` files for existing 10 blocks (Phase 2)
- Adding 10 new preview blocks (Phase 2)
- DTCG JSON export file (Phase 3)
- Style Dictionary integration (Phase 3)
- Storybook Token Addon wiring (Phase 3)

---

## DTCG Naming Convention

### Token path structure

DTCG uses dot-separated group paths. This project's existing internal role names map directly:

| Internal role | DTCG path | CSS variable |
|---|---|---|
| `surface.raised` | `color.surface.raised` | `--color-surface-raised` |
| `text.default` | `color.text.default` | `--color-text-default` |
| `border.focus` | `color.border.focus` | `--color-border-focus` |

The CSS variable naming is already DTCG-aligned (dot → hyphen). No renaming needed anywhere.

### Primitive token paths

Global scale steps are named:

| Scale | DTCG path | CSS variable |
|---|---|---|
| Light step 6 | `color.neutral.6` | `--color-neutral-6` |
| Dark step 3 | `color.neutral.dark.3` | `--color-neutral-dark-3` |

### Alias syntax

Semantic token `$value` fields use DTCG curly-brace references to primitive tokens:

```json
{
  "color": {
    "surface": {
      "raised": {
        "$value": "{color.neutral.6}",
        "$type": "color",
        "$description": "Elevated surface — analytics tiles, modals lifted above page."
      }
    }
  }
}
```

This makes the primitive reference machine-readable for Style Dictionary in Phase 3.

---

## SystemToken Type Changes

`lib/neutral-engine/types.ts` — additive changes only, no existing fields removed:

```ts
export type SystemToken = {
  // existing fields unchanged
  name: string          // dot-path role: "surface.raised"
  theme: 'light' | 'dark' | 'darkElevated'
  // ...

  // new DTCG fields
  $type: 'color'
  $description?: string
}
```

The full DTCG path (`color.surface.raised`) is derived at use-sites by prefixing `color.` to `name`.
No stored redundancy.

---

## CSS Variable Inheritance

### exportCssVariables change

`lib/neutral-engine/exportFormats.ts` emits two new scopes after the existing `[data-theme]` blocks:

```css
[data-preview-theme="light"] {
  --color-surface-raised: oklch(…);
  --color-text-default:   oklch(…);
  /* … all semantic tokens, light values … */
}

[data-preview-theme="dark"] {
  --color-surface-raised: oklch(…);
  --color-text-default:   oklch(…);
  /* … all semantic tokens, dark values … */
}
```

These scopes are parallel to `[data-theme]` — same token names, different selector. The app theme
and preview theme are independent.

### ThemeComparisonFrame change

```tsx
// before
<div className="flex min-w-0 flex-col gap-8">

// after
<div
  className="flex min-w-0 flex-col gap-8"
  data-preview-theme={theme === 'light' ? 'light' : 'dark'}
>
```

`ThemeComparisonFrame`'s `theme` prop is already `'light' | 'dark'`. The attribute maps directly.

### New block authoring convention

New blocks (Phase 2) use Tailwind CSS variable utilities:

```tsx
// before (inline style)
<div style={{ backgroundColor: c.raised, borderColor: c.bd }}>

// after (CSS var utility)
<div className="bg-(--color-surface-raised) border border-(--color-border-default)">
```

The `dark:` variant works automatically because `[data-preview-theme="dark"]` satisfies the
`@custom-variant dark` selector defined in `globals.css`:
```css
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

**Required:** The `@custom-variant` selector must be extended to also match `[data-preview-theme='dark']`
for Tailwind `dark:` utilities to work inside preview blocks. Without this change, CSS variable
inheritance works but Tailwind `dark:` class variants silently do nothing inside blocks.

Updated selector:
```css
@custom-variant dark (
  &:where(
    [data-theme='dark'], [data-theme='dark'] *,
    [data-preview-theme='dark'], [data-preview-theme='dark'] *
  )
);
```

### Narrowed c.* prop

`ResolvedBlockColors` is narrowed to two values that cannot be expressed as static CSS variables:

```ts
export type ResolvedBlockColors = {
  brand: string     // runtime oklch from brandPlaneOklch — varies per workbench config
  scrimBg: string   // alpha-mixed color-mix() value — computed from alpha config
}
```

All other roles (`page`, `raised`, `td`, `bs`, etc.) are removed. Existing blocks are migrated
in Phase 2. New blocks never receive these aliases.

---

## BlockChainSpec Type

New file: `components/preview/blockChainTypes.ts`

```ts
export type ChainEntry = {
  /** Human-readable element label shown in the drawer. E.g. "Card surface" */
  element: string
  /** Full DTCG token path. E.g. "color.surface.raised" */
  dtcgPath: string
  /** CSS custom property name. E.g. "--color-surface-raised" */
  cssVar: string
  /** CSS property this token is applied to. E.g. "background-color" */
  usage: string
  /** Optional DS rationale — shown as a tooltip or subtext in the drawer */
  description?: string
}

export type BlockChainSpec = {
  /** Must match PreviewBlockCase.id */
  blockId: string
  entries: ChainEntry[]
}
```

### File colocation convention

Each block's chain spec lives alongside its component file:

```
components/preview/blocks/
  DataCardBlock.tsx          ← unchanged
  DataCardBlock.chain.ts     ← new, exports const chainSpec: BlockChainSpec
  FormFieldBlock.tsx
  FormFieldBlock.chain.ts
  …
```

Named export is always `chainSpec`. Import is always:
```ts
import {chainSpec} from '@/components/preview/blocks/DataCardBlock.chain'
```

### Registry integration

`PreviewBlockCase` in `previewBlockRegistry.tsx` gains an optional field:

```ts
export type PreviewBlockCase = {
  id: string
  eyebrow: string
  title: string
  intent: string
  Component: ComponentType<BlockCaseProps>
  chainSpec?: BlockChainSpec   // required for new blocks; backfilled on existing in Phase 2
}
```

---

## TokenChainDrawer

New file: `components/preview/TokenChainDrawer.tsx`

### Responsibility

Single drawer instance for the entire preview workbench. Displays the token chain for one block
at a time. Updates live as `tokenView` changes (workbench state change → re-render).

### Props

```ts
type Props = {
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  selectedBlockId: string | null
  onClose: () => void
}
```

### State

`selectedBlockId` is owned by `components/sections/PreviewSection.tsx` — the page-level shell
that already composes `SemanticPreviewWorkbench` and controls layout. The drawer is stateless —
purely driven by props passed down from `PreviewSection`.

### Chain resolution

For each `ChainEntry` in the selected block's `chainSpec`:

1. Find the `SystemToken` in `lightTokenView` (and `darkTokenView`) whose `name` matches the
   entry's `dtcgPath` suffix (e.g. `surface.raised`)
2. Resolve the primitive index from the token's source mapping
3. Look up `GlobalSwatch[index]` for hex + oklch values
4. Render one row per entry, two columns (light / dark)

### Rendered row anatomy

```
[● swatch]  color.neutral.6       →  color.surface.raised  →  --color-surface-raised  →  background-color
             oklch(22.3% 0 none)      Card surface
```

Light and dark columns shown side by side so the user can see how the same semantic role resolves
to different primitive steps per theme.

### Trigger

Each `PreviewBlockSection` renders a small **"Token chain"** icon button in its header. Clicking
sets `selectedBlockId` to `block.id` and opens the drawer. The button is visible regardless of
inspection mode.

---

## Data Flow

```
Workbench scale/mapping change
  → lightTokenView, darkTokenView updated (NeutralWorkbenchProvider)
    → TokenChainDrawer receives new tokenViews via props
      → resolves ChainEntry[] for selectedBlockId
        → renders live primitive swatches + values
```

No stale state. No separate subscription. The drawer re-renders whenever the parent does.

---

## File Changelist

| File | Change |
|---|---|
| `lib/neutral-engine/types.ts` | Add `$type`, `$description` to `SystemToken` |
| `lib/neutral-engine/exportFormats.ts` | Emit `[data-preview-theme="light/dark"]` scopes |
| `app/globals.css` | Extend `@custom-variant dark` to include `[data-preview-theme='dark']` |
| `components/preview/blockChainTypes.ts` | New — `ChainEntry`, `BlockChainSpec` types |
| `components/preview/blockTypes.ts` | Narrow `ResolvedBlockColors` to `brand` + `scrimBg` |
| `components/preview/previewBlockRegistry.tsx` | Add `chainSpec?: BlockChainSpec` to `PreviewBlockCase` |
| `components/preview/ThemeComparisonFrame.tsx` | Add `data-preview-theme` attribute |
| `components/preview/BlockTokenChainPanel.tsx` | New — chain rows renderer (used inside drawer) |
| `components/preview/TokenChainDrawer.tsx` | New — drawer shell + chain resolution |
| `components/preview/PreviewBlockSection.tsx` | Add "Token chain" trigger button |
| `components/preview/composed/SemanticPreviewWorkbench.tsx` | Wire `selectedBlockId` state + drawer |
| `components/preview/blocks/DataCardBlock.chain.ts` | New — first chainSpec (reference impl) |

---

## Phase Boundary

**This spec ends at the reference implementation.** `DataCardBlock.chain.ts` is the reference
`.chain.ts` that all Phase 2 block specs follow. Phase 2 covers:

- `.chain.ts` files for all 10 existing blocks
- Migration of existing blocks from `c.*` inline styles to CSS var utilities
- 10 new preview blocks (forms, CTAs, hero, checkout, layout structures), each shipping with a
  `.chain.ts` from day one

---

## DS Concept Reference

| Concept | Where it lives in this codebase |
|---|---|
| Primitive tokens (Tier 1) | `GlobalSwatch[]` — the neutral scale steps |
| Semantic tokens (Tier 2) | `SystemToken[]` — role-mapped aliases like `surface.raised` |
| Component tokens (Tier 3) | `BlockChainSpec.entries` — component-level usage declarations |
| Token inheritance | `[data-preview-theme]` CSS scope — ancestor sets, descendants inherit |
| DTCG alias reference | `{color.neutral.6}` in `$value` — links semantic back to primitive |
| Style Dictionary input | `BlockChainSpec` is the component token layer SD would consume (Phase 3) |
