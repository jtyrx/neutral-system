# Preview Block Section Tiers — Design Spec

**Date:** 2026-05-25  
**Status:** Implemented  
**Scope:** `previewBlockSectionLayout.ts`, `PreviewBlockSection.tsx`, `previewBlockRegistry.tsx`

---

## Problem

Preview blocks serve different jobs (single field, app shell, variant matrix, token grid), but most sections still share the same `ns-overlay-card` shell and unconstrained content width. Per-block layout exists (`sectionLayout` on `PreviewBlockCase`) but:

- Preset names (`matrix`, `stage`, `shell`, `narrow`) describe implementation shape, not function.
- Shell density and content footprint are configured separately; only some blocks set either.
- Five of ten registry entries use implicit defaults, so rhythm stays uniform despite different specimen needs.

Experts scanning the workbench should read section **size** as intentional: a matrix block should feel like a canvas; a labeled field should feel compact without nested chrome fighting the specimen.

---

## Goals

1. **Unified size tiers** — Each tier sets shell, header rhythm, section padding, content max-width, and comparison defaults together (user choice **C**).
2. **Explicit registry assignment** — Every `PreviewBlockCase` sets `sectionLayout: previewSectionLayouts.<tier>` (user choice **A**); no inferred tiers.
3. **Predictable extension** — New blocks pick a tier from a four-name vocabulary; tier definitions live in one file.
4. **No specimen logic in section shell** — Tiers only affect `PreviewBlockSection` and `SemanticPreviewWorkbench` comparison wiring; block components stay unchanged unless they duplicate padding that tiers now own.

---

## Non-Goals

- Changing specimen markup inside individual blocks (e.g. `PreviewBlockCanvas` tones).
- Auto-tiering from block category tags or `id` heuristics.
- Responsive breakpoint-specific tier switching (one tier per block for v1).
- Header typography scale tokens (v1 uses spacing/gap only; `headerDensity` is optional follow-up).

---

## Tier Definitions

Four tiers. Each maps to a single entry in `previewSectionLayouts`.

### `compact`

| Property | Value |
|----------|--------|
| Shell | `card` |
| Section padding | Tighter than default overlay card (`sectionClassName`: reduced padding on `ns-overlay-card`) |
| Header gap | `tight` |
| Content | `max-w-md` |
| Comparison | `splitGap: default` |

**Use when:** Single-column controls, minimal vertical mass (labeled field).

### `standard`

| Property | Value |
|----------|--------|
| Shell | `card` |
| Section padding | Default `ns-overlay-card` |
| Header gap | `default` |
| Content | No max-width (fluid within section) |
| Comparison | `splitGap: default` |

**Use when:** Typical component specimens (cards, callouts, form control sets, feedback, overlays).

### `wide`

| Property | Value |
|----------|--------|
| Shell | `flat` |
| Section padding | Flat panel (`p-8 sm:p-10` via existing flat shell) |
| Header gap | `tight` |
| Content | Fluid (optional `max-w-5xl` only if needed after visual pass) |
| Comparison | `splitGap: wide`, `hideLabels: true` where specimens are self-explanatory |

**Use when:** Horizontal specimens need room but not full bleed (app shell, elevation ladder).

### `canvas`

| Property | Value |
|----------|--------|
| Shell | `flush` |
| Section padding | None at section level; specimen inner padding owns rhythm |
| Header gap | `tight` |
| Content | `min-w-0` (horizontal scroll safe) |
| Comparison | `splitGap: tight` |

**Use when:** Matrices, swatch grids, wide tables (`overflow-x-auto` specimens).

---

## Registry Mapping

Every entry in `PREVIEW_BLOCK_CASES` must set `sectionLayout` explicitly.

| Block `id` | Tier |
|------------|------|
| `form-field` | `compact` |
| `data-card` | `standard` |
| `callout` | `standard` |
| `form-controls` | `standard` |
| `feedback` | `standard` |
| `overlay-menu` | `standard` |
| `layout-nav` | `wide` |
| `surface-hierarchy` | `wide` |
| `button-variants` | `canvas` |
| `color-token-inspector` | `canvas` |

---

## API Changes

### `previewBlockSectionLayout.ts`

1. Replace preset keys:
   - `narrow` → `compact`
   - `default` → `standard` (keep as default resolver fallback)
   - `shell` + `stage` → absorbed into `wide` / `canvas` per table above
   - `matrix` → `canvas`
2. Add optional `sectionClassName` on each tier preset for compact card padding.
3. Document each tier in a short JSDoc above the preset (function, not implementation).
4. Export tier names as a union type for docs/tests if useful: `PreviewSectionTier`.

Resolver (`resolvePreviewBlockSectionLayout`) unchanged in shape; tiers are complete `PreviewBlockSectionLayout` objects.

### `PreviewBlockSection.tsx`

No structural change. Continues to call `previewSectionShellClass`, `previewSectionHeaderContentGapClass`, and `resolved.contentClassName` / `sectionClassName`.

Verify compact tier: `ns-overlay-card` + override padding does not fight `overflow: hidden` on matrix blocks (canvas uses `flush`, not card).

### `previewBlockRegistry.tsx`

- Assign `sectionLayout: previewSectionLayouts.<tier>` on all ten cases.
- Remove references to deprecated preset names.

### `SemanticPreviewWorkbench.tsx`

No API change; already passes `block.sectionLayout` through.

---

## Migration / Aliases

**v1:** Rename presets in one pass (10 call sites). Do not keep deprecated aliases unless an external consumer imports `previewSectionLayouts.matrix` (grep before delete).

If external imports exist, re-export deprecated keys as one-line aliases to new tiers for one release, then remove.

---

## Acceptance Criteria

1. All ten preview blocks declare an explicit tier preset in the registry.
2. Visual pass: compact field block is visibly narrower and tighter than standard card blocks.
3. Canvas blocks (`button-variants`, `color-token-inspector`) scroll horizontally without clipping; no double card chrome around the matrix/grid.
4. Wide blocks (`layout-nav`, `surface-hierarchy`) use flat shell and wider split gap; theme labels hidden when tier says so.
5. `pnpm type-check` passes.
6. No change required to block `.tsx` specimens unless duplicate outer padding is found during implementation.

---

## Testing

- Manual: open semantic preview workbench in split comparison; scroll full list; confirm four distinct section silhouettes.
- Automated: optional snapshot or unit test that every `PREVIEW_BLOCK_CASES` id has `sectionLayout` defined (lint rule or simple test file).

---

## Follow-Ups (Out of Scope)

- `headerDensity: 'compact'` for smaller title/intent type on `compact` / `canvas` tiers.
- Per-tier workbench vertical gap between sections (`SemanticPreviewWorkbench` `gap-20`).
- Tier legend in workbench UI for onboarding.

---

## Decision Log

| Decision | Choice |
|----------|--------|
| Size means | Content footprint + shell density together |
| Assignment | Explicit per block in registry |
| Approach | Rename/expand `previewSectionLayouts` presets (not separate `tier` field) |
| Tier count | Four: `compact`, `standard`, `wide`, `canvas` |
