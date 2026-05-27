# Color Palettes Page — Implementation Plan

## 1. Executive Summary

We are building a new `/colors` route that generates nine-stop OKLCH color palettes with max-gamut chroma, per-theme lightness curves, and first-class accessibility reporting. The five most consequential decisions: (1) **lightness-anchored generation** — fixed `L[9]` per theme, chroma maxed freely via the existing `maxInGamutChroma` primitive — which is faster and more predictable than APCA-inverse solving; (2) **recomputed dark theme** — separate `L[9]` arrays per theme, solved independently, not mirrored; (3) **`lib/color-engine/`** as a clean parallel module that does not touch `lib/neutral-engine/`; (4) **separate localStorage key** so development never risks corrupting neutral presets; (5) **primitives only** — `--color-blue-1…9` / `--color-blue-dark-1…9`, no semantic layer this pass. The engine reuses `maxInGamutChroma` (gamutProbing.ts), `computeContrast` (contrastModel.ts), and `displayGamut.ts` from the neutral engine — zero duplication.

---

## 2. Engine Module Layout

```
lib/color-engine/
  types.ts            — OklchStop, PaletteConfig, ChromaPolicy, PaletteName, all public types
  generate.ts         — generatePalette(opts): OklchStop[]  (core function)
  presetLightness.ts  — LIGHT_L, DARK_L, PALETTE_LIGHT_L, PALETTE_DARK_L constants
  presetHues.ts       — DEFAULT_HUES: Record<PaletteName, number>  (starting hue per palette)
  contrastReport.ts   — contrastReport(fg, bg, model): ContrastReport  (thin wrapper)
  exportFormats.ts    — exportPalettesCss(palettes, theme): string  (CSS variable blocks)
  index.ts            — type-only barrel (export type * from './types')
```

**Import policy (mirrors neutral-engine):**
- Runtime: `import { generatePalette } from '@/lib/color-engine/generate'`
- Types: `import type { OklchStop } from '@/lib/color-engine'`
- No runtime barrel imports. `lib/color-engine/index.ts` is `export type` only.

**Shared primitives (import directly, do not copy):**
- `maxInGamutChroma` from `@/lib/neutral-engine/gamutProbing`
- `computeContrast` from `@/lib/neutral-engine/contrastModel`
- `getDisplayGamutSnapshot`, `subscribeDisplayGamut` from `@/lib/neutral-engine/displayGamut`
- `serializeColor` from `@/lib/neutral-engine/serialize`

---

## 3. Public API

```ts
// lib/color-engine/types.ts

export type PaletteName = 'blue' | 'green' | 'orange' | 'yellow' | 'red' | 'purple'

export type ChromaPolicy = 'max' | 'even'

export type PaletteTheme = 'light' | 'dark'

export type PaletteGamut = 'srgb' | 'display-p3'

export type OklchStop = {
  index: number                    // 1–9
  L: number
  C: number
  H: number
  hex: string                      // sRGB-clipped hex
  oklchCss: string                 // "oklch(0.65 0.18 264)"
  inSrgb: boolean
  inP3: boolean
  contrastOnWhite: { wcag: number; apca: number }
  contrastOnBlack: { wcag: number; apca: number }
  contrastOnSurface: { wcag: number; apca: number }  // surface.default anchor (stop index 1)
}

export type PaletteConfig = {
  name: PaletteName
  hue: number                      // OKLCH H, 0–360
  chromaPolicy: ChromaPolicy
}

export type GeneratedPalette = {
  config: PaletteConfig
  light: OklchStop[]               // length 9
  dark: OklchStop[]                // length 9
}

export type ContrastReport = {
  wcag: number
  apca: number
}
```

```ts
// lib/color-engine/generate.ts

/**
 * Generates 9 OKLCH stops for one palette in one theme.
 * Reuses maxInGamutChroma from gamutProbing.ts (MINDE, matches Harmonizer).
 *
 * @param lightness - Length-9 OKLCH L values for this theme, stop 1→9. Source: presetLightness.ts.
 */
export function generatePalette(opts: {
  name: PaletteName
  hue: number
  theme: PaletteTheme
  gamut: PaletteGamut
  chromaPolicy: ChromaPolicy
  lightness: readonly number[]     // length 9
}): OklchStop[]
```

```ts
// lib/color-engine/contrastReport.ts

/**
 * Contrast between two OKLCH stops (or a stop and a fixed anchor).
 * Delegates to computeContrast from contrastModel.ts for both models.
 * For badge display, colorjs.io APCA (mean ΔLc 1.12) is acceptable.
 * For ramp-pick math, use apca-w3 directly (ΔLc up to 11 straddles ARC buckets).
 */
export function contrastReport(
  fg: OklchStop | { L: number; C: number; H: number },
  bg: OklchStop | { L: number; C: number; H: number },
  model: ContrastModel,
): ContrastReport
```

```ts
// lib/color-engine/exportFormats.ts

/**
 * Emits CSS variable blocks for all palettes.
 * Light:  --color-<name>-1 … --color-<name>-9
 * Dark:   --color-<name>-dark-1 … --color-<name>-dark-9
 *
 * Output (worked example for blue, one palette):
 *
 *   :root {
 *     --color-blue-1: oklch(0.97 0.018 264);
 *     …
 *     --color-blue-9: oklch(0.18 0.17 264);
 *   }
 *   [data-theme="dark"] {
 *     --color-blue-dark-1: oklch(0.12 0.04 264);
 *     …
 *     --color-blue-dark-9: oklch(0.94 0.06 264);
 *   }
 */
export function exportPalettesCss(palettes: GeneratedPalette[]): string
```

---

## 4. Route and Component Layout

```
app/
  colors/
    page.tsx                      — thin: export default function Page() { return <ColorWorkbench /> }
    layout.tsx                    — if sidebar nav entry needed; otherwise inherit root layout

components/
  colors/
    ColorWorkbench.tsx            — 'use client' orchestration shell (mirrors Workbench.tsx pattern)
    ColorPaletteGrid.tsx          — grid of palette rows × 9 stop columns
    ColorSwatchCell.tsx           — single swatch: color + gamut badge + contrast readout
    ColorContrastPanel.tsx        — APCA/WCAG toggle + three-anchor contrast panel
    ColorPaletteControls.tsx      — hue input, chroma policy toggle, gamut display
    ColorExportSection.tsx        — copy CSS variables button

hooks/
  useColorPalettes.ts             — main state hook (mirrors useNeutralWorkbench pattern)

components/
  providers/
    ColorPalettesProvider.tsx     — context provider (mirrors NeutralWorkbenchProvider)

lib/
  color-palettes/
    colorPalettesStorage.ts       — localStorage read/write, key: 'color-palettes:workbench:v1'
```

**Component rules:** all components in `components/colors/` follow `components/ui/AGENTS.md`. `displayName` required on every exported component function. No subdirectories — flat files only. State accessed only via `ColorPalettesProvider` context, never by calling `useColorPalettes` directly inside leaf components.

---

## 5. State Model

### Hook shape (`useColorPalettes.ts`)

```ts
type ColorPalettesState = {
  palettes: PaletteConfig[]          // ordered: blue, green, orange, yellow, red, purple
  chromaPolicy: ChromaPolicy         // global toggle ('max' | 'even')
  gamut: PaletteGamut                // 'display-p3' default
  contrastModel: ContrastModel       // 'wcag-2.1' | 'apca'
  generatedPalettes: GeneratedPalette[]  // derived, not persisted
}
```

### Provider boundary

`ColorPalettesProvider` wraps only `app/colors/`. It does not share state with `NeutralWorkbenchProvider`. The two systems are fully independent.

### localStorage schema

```ts
// lib/color-palettes/colorPalettesStorage.ts

const STORAGE_KEY = 'color-palettes:workbench:v1'

type ColorPalettesPersistedV1 = {
  v: 1
  palettes: Array<{
    name: PaletteName
    hue: number
    chromaPolicy: ChromaPolicy
  }>
  chromaPolicy: ChromaPolicy
  gamut: PaletteGamut
  contrastModel: ContrastModel
}
```

Migration story: v1 ships with this build. When semantic tokens are added later, bump to v2 with a `migrateV1toV2` function following the pattern in `lib/workbench/workbenchStorage.ts`. No v3 bump to the neutral schema — the keys are independent.

---

## 6. CSS Variable Export

Worked example for `blue`, Display-P3 gamut:

```css
/* Tier-1 color primitives — paste into globals.css or export as standalone file */

:root {
  /* Blue — light theme */
  --color-blue-1: oklch(0.97 0.018 264);
  --color-blue-2: oklch(0.93 0.042 264);
  --color-blue-3: oklch(0.87 0.075 264);
  --color-blue-4: oklch(0.78 0.120 264);
  --color-blue-5: oklch(0.66 0.175 264);  /* cusp — max chroma */
  --color-blue-6: oklch(0.54 0.168 264);
  --color-blue-7: oklch(0.42 0.148 264);
  --color-blue-8: oklch(0.30 0.115 264);
  --color-blue-9: oklch(0.18 0.078 264);
}

[data-theme="dark"] {
  /* Blue — dark theme */
  --color-blue-dark-1: oklch(0.12 0.032 264);  /* near-black surface */
  --color-blue-dark-2: oklch(0.18 0.058 264);
  --color-blue-dark-3: oklch(0.26 0.092 264);
  --color-blue-dark-4: oklch(0.36 0.135 264);
  --color-blue-dark-5: oklch(0.48 0.172 264);
  --color-blue-dark-6: oklch(0.60 0.175 264);
  --color-blue-dark-7: oklch(0.72 0.152 264);
  --color-blue-dark-8: oklch(0.84 0.098 264);
  --color-blue-dark-9: oklch(0.94 0.042 264);  /* near-white text */
}
```

**Gamut fallback strategy:** the CSS output emits raw `oklch()` values. Browsers that do not support Display-P3 automatically clip to sRGB. No `@supports (color: color(display-p3 0 0 0))` wrapper is needed — `oklch()` with out-of-sRGB values degrades gracefully via CSS gamut mapping. The `inSrgb`/`inP3` flags on `OklchStop` drive gamut badge rendering only.

---

## 7. Accessibility Panel UI Spec

Each `ColorSwatchCell` shows a gamut badge (top-right corner) and, on hover/selection, expands to a contrast panel.

**Contrast panel (per swatch):**

```
┌─────────────────────────────────────────┐
│  [APCA] [WCAG]   ← runtime toggle       │
├─────────────────┬───────────────────────┤
│  vs white       │  Lc 89 / 4.6:1       │
│  vs black       │  Lc 12 / 1.2:1       │
│  vs surface     │  Lc 45 / 3.1:1       │
└─────────────────┴───────────────────────┘
```

- **APCA** mode shows `Lc <value>` with pass/fail against Harmonizer targets: Lc ≥ 90 → "Best for text", Lc ≥ 75 → "Body text", Lc ≥ 60 → "Large text", Lc ≥ 45 → "UI only", below → "Non-text only"
- **WCAG** mode shows `<ratio>:1` with AA/AAA pass/fail badges (matching the pattern in `components/workbench/Inspector.tsx`)
- `contrastModel` toggle lives in the page header (mirrors `WorkbenchHeader` pattern)
- "vs surface" anchor = stop 1 of the current theme's neutral ramp (resolved from `useNeutralWorkbenchContext` if available; falls back to `oklch(0.97 0 0)` white / `oklch(0.12 0 0)` dark if the neutral workbench is not in scope)

**Reference screenshots:** Huetone APCA grid (stop labels 100–900 = our 1–9), the OKLCH picker accessibility panel with WCAG AA/AAA badges and APCA Lc readout, Harmonizer's column-header contrast values.

---

## 8. Gamut Badge Spec

```
ColorSwatchCell
  └── <div class="swatch-color" style="background: var(--color-blue-5)">
        <span class="gamut-badge" data-tier="p3">P3</span>
      </div>
```

**Badge tiers (mutually exclusive, show highest achievable):**

| `inSrgb` | `inP3` | Badge | Label |
|----------|--------|-------|-------|
| true     | true   | none  | (omit — sRGB is baseline, no badge needed) |
| false    | true   | `P3`  | display-p3 only |
| false    | false  | `P3+` | out-of-P3 gamut (rec2020 or beyond) |

`inSrgb`/`inP3` come directly from `OklchStop`. No extra computation in the component.

Visual: small pill in the top-right corner of the swatch cell, matching the `P3` chip style in Harmonizer and the existing `MultiGamutSample` surface in the neutral workbench inspector.

---

## 9. Phased Implementation Plan

| Phase | Files touched | Gate | Verification |
|-------|--------------|------|-------------|
| **0 — Scaffold** | `lib/color-engine/types.ts`, `lib/color-engine/index.ts`, `lib/color-palettes/colorPalettesStorage.ts` | Before any further work | `pnpm type-check` |
| **1 — Engine core** | `lib/color-engine/generate.ts`, `lib/color-engine/presetLightness.ts`, `lib/color-engine/presetHues.ts`, `lib/color-engine/contrastReport.ts` | After Phase 0 approved | `pnpm type-check` + manual `generatePalette` smoke test in Node REPL |
| **2 — Export** | `lib/color-engine/exportFormats.ts` | After Phase 1 passes | `pnpm type-check`, verify CSS output for blue palette matches §6 example |
| **3 — Route + provider** | `app/colors/page.tsx`, `components/providers/ColorPalettesProvider.tsx`, `hooks/useColorPalettes.ts` | After Phase 2 | `pnpm type-check` + route loads without error at `/colors` |
| **4 — Grid UI** | `components/colors/ColorWorkbench.tsx`, `ColorPaletteGrid.tsx`, `ColorSwatchCell.tsx` | After Phase 3 | `pnpm dev` + visual check of 6 × 9 grid, gamut badges |
| **5 — Controls + contrast panel** | `ColorPaletteControls.tsx`, `ColorContrastPanel.tsx`, `ColorExportSection.tsx` | After Phase 4 | Chroma policy toggle changes grid, APCA/WCAG toggle updates badge labels |
| **6 — Persistence** | `colorPalettesStorage.ts` read/write wired into `useColorPalettes` | After Phase 5 | Reload preserves hue/policy, storage key `color-palettes:workbench:v1` confirmed in DevTools |

**Breaking-change checklist per phase:**
- Phases 0–2: engine-only, zero UI surface — no breaking changes possible
- Phase 3: new route; does not touch `app/page.tsx` or existing providers
- Phases 4–6: new components; `sweep.sh` compliance required before merge

---

## 10. Risks and Open Questions

| Risk | Severity | Mitigation |
|------|----------|-----------|
| APCA inversion (for validation) — stop 5 at L=0.66 may not hit Lc 51 for yellow/green hues where the cusp is higher | Medium | Run generatePalette for all six hues in Phase 1 and compare `contrastOnWhite.apca` against Harmonizer Lc targets; adjust L array if >10 Lc off |
| Yellow/green `even` chroma bottleneck may produce visually flat palettes | Low | Yellow has high gamut width at mid-L; only a concern if the palette feels washed out — expose a `chromaScale` multiplier (Q7 deferred feature) if needed |
| `surface.default` fallback when neutral workbench is not in scope | Low | Fall back to `oklch(0.97 0 0)` / `oklch(0.12 0 0)` for light/dark; document this as expected behavior |
| Sidebar navigation entry — where does it live in `app/layout.tsx`? | Needs decision | See open question below |

**Open question before Phase 3 begins:** Where does the `/colors` sidebar nav entry render? The current `app/layout.tsx` may need a shared navigation shell. Confirm: add a top-level nav to `app/layout.tsx` with entries for `/` (Workbench) and `/colors` (Colors)?

---

## 11. Naming Proposal for the New Engine Module

Three candidates:

| Name | Rationale |
|------|-----------|
| **`lib/color-engine/`** ✓ | Exact parallel to `lib/neutral-engine/`. Communicates scope ("color primitives, not semantic tokens") without prejudging future architecture. Clean boundary — merge deliberately later if models converge. **Recommended.** |
| `lib/palette-engine/` | More specific (only palettes). Too narrow if the engine later takes on gamut mapping, color harmonics, or hue extraction. |
| `lib/color-system/` | Implies the whole color system, including neutrals. Premature unification — would need to absorb `lib/neutral-engine/` to be honest about the name. |

**Decision:** `lib/color-engine/`. Matches the locked §2 answer.

---

## Research sources

| Claim | Source |
|-------|--------|
| Primer 10-stop scale, OKLCH L/C/H values | `docs/research/color-palettes/primer-audit.md` §1 (live data from `github/primer/primitives`) |
| Primer hue drift is a byproduct, not policy | `primer-audit.md` §2 |
| Primer WCAG 2.x AA only | `primer-audit.md` §4 |
| Stripe ~linear L distribution, mild front-load | `docs/research/color-palettes/stripe-audit.md` §4 |
| Stripe algorithmic contrast advantage | `stripe-audit.md` §3 |
| Harmonizer APCA targets: 100,90,77,65,51,65,77,90,100 | `docs/research/color-palettes/harmonizer-huetone-spec.md` §1 |
| Max/even chroma algorithms | `harmonizer-huetone-spec.md` §2 |
| generatePalette pseudocode | `harmonizer-huetone-spec.md` §4 |
| Preset L arrays | `harmonizer-huetone-spec.md` §5 |
| maxInGamutChroma MINDE, matches Harmonizer | `docs/research/color-system/SYNTHESIS.md` §3 |
| computeContrast / ContrastModel interface | `lib/neutral-engine/contrastModel.ts` |
| surface.default = index 1 | Architecture lock (§3 Q6 answers) |

---

**Gate 3 — awaiting approval before any code change in `lib/**`, `app/**`, or `components/**`.**
