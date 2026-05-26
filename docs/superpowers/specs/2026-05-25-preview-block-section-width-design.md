# Preview Block Section Width & Alignment — Design Spec

**Date:** 2026-05-25  
**Status:** Implemented  
**Scope:** `previewBlockSectionLayout.ts`, `PreviewBlockSection.tsx`, `previewBlockRegistry.tsx`  
**Builds on:** [2026-05-25-preview-block-section-tiers-design.md](./2026-05-25-preview-block-section-tiers-design.md)

---

## Problem

Section **tiers** (`compact`, `standard`, `wide`, `canvas`) adjust shell density and comparison rhythm, but `max-w-*` on the **content slot** only narrows specimens. The `<section>` element (including `#preview-block-1-title`, intent copy, and card chrome) still spans 100% of the workbench column.

Result: every block reads as full-width; tier differences are subtle. Experts want the **whole section frame** to reflect content mass: a labeled field should be a narrow card; a button matrix should span the column.

---

## Goals

1. **Whole-section width** — `sectionWidth` caps `<section>`, not only the inner content div (user choice **A**).
2. **Per-block alignment** — `sectionAlign` set explicitly on each registry entry (user choice **D**).
3. **Extend existing layout object** — add fields to `PreviewBlockSectionLayout`; tiers supply defaults; registry may override (Approach 1).
4. **Preserve tiers** — shell, header gap, and comparison behavior unchanged; width is an additional axis.
5. **Split comparison safe** — `full` + `min-w-0` on canvas content retains horizontal scroll for matrices.

---

## Non-Goals

- Auto-measuring DOM content width (`ResizeObserver`).
- Responsive tier switching at breakpoints (v1 uses fixed width per block).
- Staggered/masonry layouts between sections.
- Changing specimen markup inside block components (unless duplicate `max-w-*` is found).

---

## API

### New fields on `PreviewBlockSectionLayout`

```typescript
sectionWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
sectionAlign?: 'start' | 'center'
```

Resolved on `<section>` as:

```text
w-full + max-w-* (from sectionWidth) + mr-auto | mx-auto (from sectionAlign)
```

### Width token map

| Token | Classes | Use |
|-------|---------|-----|
| `xs` | `max-w-sm` | Reserved; optional micro specimens |
| `sm` | `max-w-md` | Single field, minimal mass |
| `md` | `max-w-2xl` | Standard component specimens |
| `lg` | `max-w-4xl` | Dense form control sets |
| `xl` | `max-w-6xl` | App shell, elevation ladder |
| `full` | (no max-width cap) | Matrices, token grids |

Default when omitted: `full` (backward-safe; registry will set explicitly on all blocks).

### Alignment map

| Value | Class | Use |
|-------|-------|-----|
| `start` | `mr-auto` | Left-hugged specimens (default) |
| `center` | `mx-auto` | Focused panel in column |

Default when omitted: `start`.

### Helpers in `previewBlockSectionLayout.ts`

- `previewSectionWidthClass(width: PreviewSectionWidth): string`
- `previewSectionAlignClass(align: PreviewSectionAlign): string`
- Include width/align in `ResolvedPreviewBlockSectionLayout`
- Merge in `resolvePreviewBlockSectionLayout`

---

## Tier defaults (updated)

Each tier sets `sectionWidth` and a default `sectionAlign` (`start`). Registry entries **must** set `sectionAlign` explicitly per brainstorm decision.

| Tier | `sectionWidth` | Default align |
|------|----------------|---------------|
| `compact` | `sm` | `start` |
| `standard` | `md` | `start` |
| `wide` | `xl` | `start` |
| `canvas` | `full` | `start` |

### Tier cleanup

- Remove `contentClassName: 'max-w-md'` from `compact` (section owns width).
- Keep `contentClassName: 'min-w-0'` on `canvas` for overflow.

---

## Registry mapping

Every `PreviewBlockCase` sets `sectionLayout` with explicit `sectionAlign`. Width comes from tier defaults unless overridden.

| Block `id` | Tier | `sectionWidth` (effective) | `sectionAlign` |
|------------|------|------------------------------|----------------|
| `form-field` | compact | `sm` | `start` |
| `data-card` | standard | `md` | `start` |
| `callout` | standard | `md` | `start` |
| `overlay-menu` | standard | `md` | `center` |
| `form-controls` | standard | `lg` (override) | `start` |
| `feedback` | standard | `md` | `start` |
| `layout-nav` | wide | `xl` | `start` |
| `surface-hierarchy` | wide | `xl` | `start` |
| `button-variants` | canvas | `full` | `start` |
| `color-token-inspector` | canvas | `full` | `start` |

`form-controls` overrides tier width to `lg` because the control set is wider than a single card specimen.

Example registry entry:

```typescript
{
  id: 'form-field',
  // ...
  sectionLayout: {
    ...previewSectionLayouts.compact,
    sectionAlign: 'start',
  },
},
{
  id: 'form-controls',
  sectionLayout: {
    ...previewSectionLayouts.standard,
    sectionWidth: 'lg',
    sectionAlign: 'start',
  },
},
```

---

## Component changes

### `PreviewBlockSection.tsx`

Apply width and align on `<section>`:

```tsx
className={cn(
  previewSectionShellClass(resolved.shell),
  previewSectionHeaderContentGapClass(resolved.headerContentGap),
  previewSectionWidthClass(resolved.sectionWidth),
  previewSectionAlignClass(resolved.sectionAlign),
  resolved.sectionClassName,
  className,
)}
```

Content slot keeps `min-w-0` and tier-specific `contentClassName` only when needed (canvas scroll).

### `SemanticPreviewWorkbench.tsx`

No structural change. Parent remains `flex flex-col gap-20`; sections self-size.

---

## Acceptance criteria

1. `#preview-block-N-title` and its section card shrink together on `form-field` (visibly narrower than `button-variants`).
2. `button-variants` and `color-token-inspector` span the workbench column (`full`).
3. `overlay-menu` is centered at `md` width; others at `start` per table.
4. No duplicate `max-w-md` on compact field (section only).
5. Horizontal scroll still works on button matrix.
6. `pnpm type-check` passes.
7. All ten registry blocks declare `sectionAlign` explicitly.

---

## Testing

- **Manual:** Open semantic preview workbench; scroll blocks 01–10; confirm at least three distinct section silhouettes (sm / md–lg / full).
- **Manual:** Split comparison mode; confirm narrow blocks do not clip light/dark columns awkwardly.
- **Optional:** Unit test that `resolvePreviewBlockSectionLayout(previewSectionLayouts.compact)` yields `sectionWidth: 'sm'`.

---

## Decision log

| Decision | Choice |
|----------|--------|
| Width applies to | Whole `<section>` |
| Alignment | Per-block explicit in registry |
| API surface | Extend `PreviewBlockSectionLayout` |
| Width scale | `xs`–`full` named tokens |
| Centered exception | `overlay-menu` |

---

## Follow-ups (out of scope)

- Per-breakpoint `sectionWidth` overrides.
- `sectionAlign: 'end'` for right-hugged specimens.
- Visual tier legend in workbench UI.
