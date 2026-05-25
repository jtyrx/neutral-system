# Phase 2A: Block Migration Design Spec

**Date:** 2026-05-20
**Status:** Approved
**Scope:** Phase 2A of 3 — migrate existing 9 blocks to CSS var inheritance + add `.chain.ts`

---

## Goal

Replace JS-resolved `c.*` inline styles in all 9 existing preview blocks with Tailwind CSS variable
utilities (`bg-(--color-surface-raised)`, `text-(--color-text-default)`, etc.) so blocks inherit
tokens from the `[data-preview-theme]` ancestor scope. Colocate a typed `BlockChainSpec` alongside
each migrated block.

`DataCardBlock` is already migrated (Phase 1 reference). This spec covers the remaining 9.

---

## Non-Goals

- Adding new preview blocks (Phase 2B)
- DTCG JSON export or Style Dictionary integration (Phase 3)
- Changing `SemanticTokenAnnotation` — it stays as-is

---

## Type Layer Changes (Task 0 — done first)

### Delete `ResolvedBlockColors`, narrow to `NewBlockColors`

`ResolvedBlockColors` in `components/preview/blockTypes.ts` is deleted. `CaseRenderProps` changes
from `BlockCaseProps & {c: ResolvedBlockColors}` to `BlockCaseProps & {c: NewBlockColors}`.

`NewBlockColors` (already defined in Phase 1) carries only the two values that cannot be CSS vars:

```ts
export type NewBlockColors = {
  brand: string    // runtime oklch — varies per workbench config
  scrimBg: string  // alpha-mixed color-mix() — computed from alpha config
}
```

**Why only these two are kept:** All other semantic roles (`surface.raised`, `text.default`, etc.)
are already emitted as CSS custom properties in the `[data-preview-theme]` scope. Passing them
as JS props is redundant once blocks inherit from CSS. `brand` and `scrimBg` are runtime-computed
values that change per workbench session — they cannot be static CSS variables.

### Narrow `useResolvedBlockColors`

`components/preview/useResolvedBlockColors.ts` drops all resolved fields except `brand` and
`scrimBg`. The hook's return type changes to `NewBlockColors`.

### TypeScript as migration guide

Deleting `ResolvedBlockColors` causes TypeScript errors on every `c.page`, `c.raised`, `c.td`
etc. usage across all 9 blocks simultaneously. This is intentional — the compiler enumerates
every migration site. Each error is fixed block by block in Tasks 1–9.

---

## CSS Variable Mapping

Every `c.*` field maps directly to a CSS custom property via Tailwind's arbitrary value syntax:

| `c.*` field | Semantic role | Tailwind utility | Inline style for |
|---|---|---|---|
| `c.page` | `surface.default` | `bg-(--color-surface-default)` | — |
| `c.sunken` | `surface.sunken` | `bg-(--color-surface-sunken)` | — |
| `c.subtle` | `surface.subtle` | `bg-(--color-surface-subtle)` | — |
| `c.raised` | `surface.raised` | `bg-(--color-surface-raised)` | — |
| `c.overlay` | `surface.overlay` | `bg-(--color-surface-overlay)` | — |
| `c.inverse` | `surface.inverse` | `bg-(--color-surface-inverse)` | — |
| `c.brand` | `surface.brand` | — | `style={{backgroundColor: c.brand}}` |
| `c.td` | `text.default` | `text-(--color-text-default)` | — |
| `c.ts` | `text.subtle` | `text-(--color-text-subtle)` | — |
| `c.tm` | `text.muted` | `text-(--color-text-muted)` | — |
| `c.tdis` | `text.disabled` | `text-(--color-text-disabled)` | — |
| `c.ton` | `text.on` | `text-(--color-text-on)` | — |
| `c.bs` | `border.subtle` | `border-(--color-border-subtle)` | — |
| `c.bd` | `border.default` | `border-(--color-border-default)` | — |
| `c.bStr` | `border.strong` | `border-(--color-border-strong)` | — |
| `c.scrimBg` | `overlay.scrim` | — | `style={{backgroundColor: c.scrimBg}}` |

For `borderColor` on a specific element (not the full border shorthand), use:
```tsx
// before
style={{borderColor: c.bd}}

// after — arbitrary CSS var on a single property
className="border-[color:var(--color-border-default)]"
// or keep as inline style with CSS var
style={{borderColor: 'var(--color-border-default)'}}
```

For `boxShadow`, `color` on non-Tailwind elements (e.g. inline SVG), keep as inline style with
`var(--color-*)` syntax — Tailwind utilities don't cover these properties.

---

## Migration Order (simple → complex)

| Task | Block | `c.*` fields used | Keeps `c` prop? |
|---|---|---|---|
| 1 | `ButtonVariantsBlock` | `page` | No |
| 2 | `FormControlsBlock` | `page`, `bd`, `ts` | No |
| 3 | `ColorTokenInspectorBlock` | `page`, `bs`, `tm` | No |
| 4 | `FormFieldBlock` | `ts`, `bStr`, `bd`, `tdis` | No |
| 5 | `LayoutNavBlock` | `page`, `sunken`, `subtle`, `bs`, `td`, `ts`, `tm` | No |
| 6 | `CalloutBlock` | `inverse`, `bd`, `ton`, `brand` | Yes — `brand` |
| 7 | `OverlayMenuBlock` | `page`, `overlay`, `bs`, `bd`, `ts`, `td`, `scrimBg` | Yes — `scrimBg` |
| 8 | `SurfaceHierarchyBlock` | `sunken`, `page`, `raised`, `overlay`, `bs`, `bd`, `tm`, `ts`, `td` | No |
| 9 | `FeedbackBlock` | `page`, `overlay`, `raised`, `subtle`, `inverse`, `brand`, `bd`, `bs`, `td`, `ts`, `tm`, `ton` | Yes — `brand` |

Blocks that don't use `brand` or `scrimBg` can omit `c` from their props destructure entirely —
`BlockCaseWrapper` still computes and passes it, they simply don't reference it.

---

## `.chain.ts` Authoring Convention

Each `.chain.ts` colocates alongside its block:

```
components/preview/blocks/
  ButtonVariantsBlock.tsx
  ButtonVariantsBlock.chain.ts   ← new
```

Named export is always `chainSpec`. Entry `description` fields document the design rationale —
*why* this token choice was made, not just *what* it resolves to.

**`ChainEntry` fields:**
- `element` — human label for the element (e.g. `"Nav sidebar well"`)
- `dtcgPath` — full DTCG path (e.g. `"color.surface.sunken"`)
- `cssVar` — CSS custom property (e.g. `"--color-surface-sunken"`)
- `usage` — CSS property applied (e.g. `"background-color"`)
- `description` — *optional but encouraged* — design rationale for this role choice

**What makes a good description:**
- Explains the semantic intent, not the pixel value: *"Recessed well — creates depth below the main canvas without a hard border"*
- Notes any non-obvious choices: *"Uses border.strong not border.default — form fields need a heavier affordance than layout dividers"*
- Omit if the role name is already self-explanatory

---

## Per-Block chain.ts Token Map

### ButtonVariantsBlock
Demonstrates the full button variant × state matrix. No surface tokens from the block itself —
all button chrome comes from the `btn-sys` design token layer. One entry: page background.

| Element | DTCG path | Usage |
|---|---|---|
| Page background | `color.surface.default` | `background-color` |

### FormControlsBlock
Input default/disabled/invalid + Slider + ToggleGroup.

| Element | DTCG path | Usage |
|---|---|---|
| Page background | `color.surface.default` | `background-color` |
| Field edge | `color.border.default` | `border-color` |
| Label text | `color.text.subtle` | `color` |

### ColorTokenInspectorBlock
Swatch grid for all semantic roles.

| Element | DTCG path | Usage |
|---|---|---|
| Card background | `color.surface.default` | `background-color` |
| Card edge | `color.border.subtle` | `border-color` |
| Group label | `color.text.muted` | `color` |

### FormFieldBlock
Active input, read-only input, help text.

| Element | DTCG path | Usage |
|---|---|---|
| Field label | `color.text.subtle` | `color` |
| Active field edge | `color.border.strong` | `border-color` |
| Read-only field edge | `color.border.default` | `border-color` |
| Locked text | `color.text.disabled` | `color` |
| Help text | `color.text.subtle` | `color` |

### LayoutNavBlock
Sidebar nav, active row, workspace panel.

| Element | DTCG path | Usage |
|---|---|---|
| Page canvas | `color.surface.default` | `background-color` |
| Nav well | `color.surface.sunken` | `background-color` |
| Active nav row | `color.surface.default` | `background-color` |
| Panel | `color.surface.subtle` | `background-color` |
| Dividers | `color.border.subtle` | `border-color` |
| Primary text | `color.text.default` | `color` |
| Secondary text | `color.text.subtle` | `color` |
| Label / metadata | `color.text.muted` | `color` |

### CalloutBlock
Inverse strip + brand strip callouts.

| Element | DTCG path | Usage |
|---|---|---|
| Inverse strip | `color.surface.inverse` | `background-color` |
| Strip edge | `color.border.default` | `border-color` |
| Strip text | `color.text.on` | `color` |
| Brand strip | `color.surface.brand` | `background-color` (runtime via `c.brand`) |

### OverlayMenuBlock
Scrimmed anchor + floating action menu.

| Element | DTCG path | Usage |
|---|---|---|
| Anchor background | `color.surface.default` | `background-color` |
| Menu plane | `color.surface.overlay` | `background-color` |
| Menu edge | `color.border.default` | `border-color` |
| Divider | `color.border.subtle` | `border-color` |
| Menu item text | `color.text.default` | `color` |
| Anchor text | `color.text.subtle` | `color` |
| Scrim | `color.overlay.scrim` | `background-color` (runtime via `c.scrimBg`) |

### SurfaceHierarchyBlock
Four nested elevation planes — sunken → default → raised → overlay.

| Element | DTCG path | Usage |
|---|---|---|
| Outermost (Sunken) | `color.surface.sunken` | `background-color` |
| Outer edge | `color.border.subtle` | `border-color` |
| Default plane | `color.surface.default` | `background-color` |
| Raised plane | `color.surface.raised` | `background-color` |
| Raised edge | `color.border.default` | `border-color` |
| Overlay plane | `color.surface.overlay` | `background-color` |
| Overlay edge | `color.border.default` | `border-color` |
| Tier label (muted) | `color.text.muted` | `color` |
| Tier label (subtle) | `color.text.subtle` | `color` |
| Tier label (default) | `color.text.default` | `color` |

### FeedbackBlock
Loading skeletons + toast overlay + badge row.

| Element | DTCG path | Usage |
|---|---|---|
| Page background | `color.surface.default` | `background-color` |
| Toast plane | `color.surface.overlay` | `background-color` |
| Toast edge | `color.border.default` | `border-color` |
| Default badge | `color.surface.raised` | `background-color` |
| Default badge edge | `color.border.default` | `border-color` |
| Subtle badge | `color.surface.subtle` | `background-color` |
| Subtle badge edge | `color.border.subtle` | `border-color` |
| Inverse badge | `color.surface.inverse` | `background-color` |
| Brand badge | `color.surface.brand` | `background-color` (runtime via `c.brand`) |
| On-surface text | `color.text.on` | `color` |
| Primary text | `color.text.default` | `color` |
| Secondary text | `color.text.subtle` | `color` |
| Metadata / section labels | `color.text.muted` | `color` |

---

## File Changelist

| File | Change |
|---|---|
| `components/preview/blockTypes.ts` | Delete `ResolvedBlockColors`; update `CaseRenderProps` to use `NewBlockColors` |
| `components/preview/useResolvedBlockColors.ts` | Narrow return to `NewBlockColors` — drop all fields except `brand`, `scrimBg` |
| `components/preview/blocks/ButtonVariantsBlock.tsx` | Migrate `c.page` → CSS var; drop `c` from props |
| `components/preview/blocks/ButtonVariantsBlock.chain.ts` | New |
| `components/preview/blocks/FormControlsBlock.tsx` | Migrate `c.*` → CSS vars; drop `c` from props |
| `components/preview/blocks/FormControlsBlock.chain.ts` | New |
| `components/preview/blocks/ColorTokenInspectorBlock.tsx` | Migrate `c.*` → CSS vars; drop `c` from props |
| `components/preview/blocks/ColorTokenInspectorBlock.chain.ts` | New |
| `components/preview/blocks/FormFieldBlock.tsx` | Migrate `c.*` → CSS vars; drop `c` from props |
| `components/preview/blocks/FormFieldBlock.chain.ts` | New |
| `components/preview/blocks/LayoutNavBlock.tsx` | Migrate `c.*` → CSS vars; drop `c` from props |
| `components/preview/blocks/LayoutNavBlock.chain.ts` | New |
| `components/preview/blocks/CalloutBlock.tsx` | Migrate neutral `c.*` → CSS vars; keep `c.brand` |
| `components/preview/blocks/CalloutBlock.chain.ts` | New |
| `components/preview/blocks/OverlayMenuBlock.tsx` | Migrate neutral `c.*` → CSS vars; keep `c.scrimBg` |
| `components/preview/blocks/OverlayMenuBlock.chain.ts` | New |
| `components/preview/blocks/SurfaceHierarchyBlock.tsx` | Migrate `c.*` → CSS vars; drop `c` from props |
| `components/preview/blocks/SurfaceHierarchyBlock.chain.ts` | New |
| `components/preview/blocks/FeedbackBlock.tsx` | Migrate neutral `c.*` → CSS vars; keep `c.brand` |
| `components/preview/blocks/FeedbackBlock.chain.ts` | New |
| `components/preview/previewBlockRegistry.tsx` | Register all 9 new `chainSpec` imports |

---

## Verification

After all tasks:

```bash
pnpm type-check && pnpm test && pnpm build
```

Manual checklist:
- All 10 blocks render correctly in both light and dark preview themes
- Token chain drawer opens for all 10 blocks (all now have `chainSpec`)
- Changing workbench scale updates swatch colors in the open drawer in real time
- No inline `style={{...}}` referencing resolved hex values remain except `brand` and `scrimBg`
