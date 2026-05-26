# Color System Engine — Synthesis

> **Status.** Research deliverable. No engine code has been changed. This document is the input to a phased implementation plan, gated on user approval per phase.

## 0. Provenance & confidence

The four subagent reports (A, B, C, D) fell back to prior knowledge because `ctx_fetch_and_index` was denied at subagent runtime. External claims are directionally trustworthy but **citations are unverified**. Three benchmarks were run in-repo against live `colorjs.io@^0.6.1` and `apca-w3@0.1.9` on M-series Node — those measurements **are** verified and supersede any conflicting subagent prediction. Where this synthesis recommends a concrete behavior change, it is grounded in the measurements; where it recommends an architecture shape, it is grounded in subagent analysis and explicitly marked.

---

## 1. Executive summary

1. **Keep `colorjs.io` as the engine's color library.** Real-world perf is fine (≤ 1.8 ms for a 48-stop cold build) and a bundle play via `@colordx/core` is not justified by the spike data. Switch to `colorjs.io/fn` only if a future Lighthouse audit flags it.
2. **Delete `gamutProbing.maxInGamutChroma` and call `colorjs.io.toGamut({method:'css'})` directly.** CSS Color 4 MINDE algorithm — up to +7% chroma at boundaries, 2.3× faster, matches what Harmonizer and oklch.com show.
3. **Add APCA as an opt-in contrast model** behind a unified `computeContrast(fg, bg, model)` façade. Use `apca-w3` for ramp-pick / threshold logic (measured ΔLc up to 11 vs colorjs.io, straddles ARC buckets); colorjs.io's `.contrast(other, 'APCA')` is fine for display badges. Default model is `'wcag-2.1'` — APCA toggled in workbench header. **Engine purity preserved**: zero changes to `globalScale`, `effectiveMapping`, `semanticNaming`, `exportFormats` from this work alone.
4. **Add `chromaMode: 'max-in-gamut'`** to `GlobalScaleConfig`. Per-step chroma maxed via the same `toGamut` call. `gamutTarget` defaults to `displayGamut.ts` runtime detection; designer can override per ramp.
5. **Replace `lCurveStrength` (and the dual-pivot `A/B + pivotIndex`) with a discriminated `lightnessModel: { kind: 'linear-oklch', lMax, lMin, midpoint? }`**. Single-anchor Bezier preserves dark-vs-light bias. Cite Huetone + Ottosson. Leave room in the union for `'apca-anchored'` and `'hct-tonal'` without further schema migration.
6. **All four changes land in a single `v2` schema bump** with one `migrateV1ToV2(parsed)` in `lib/workbench/workbenchStorage.ts`.

---

## 2. Library decision — keep `colorjs.io`

**Recommendation:** single library, `colorjs.io@^0.6.1`. No façade, no hybrid.

**Rationale.** Subagent A's hybrid recommendation rested on three assumed wins for `@colordx/core`: smaller bundle, immutable plain-object records, faster hot path. The spike data invalidates the third premise (engine ramp build is already < 2 ms at 48 stops). The first two remain plausible but unmeasured, and the cost of a façade — splitting our APCA path across two libraries, maintaining a parity test forever — outweighs an unverified ~10 KB gzip win.

**Tactical bundle play (deferred).** If a future Lighthouse audit shows `colorjs.io` is a meaningful contributor, switch app-side imports to `colorjs.io/fn` (the tree-shakeable functional entry). No engine change required.

**Drop-tag for the future.** Re-evaluate when (a) `@colordx/core` ships a CSS Color 4 "to gamut" implementation matching `colorjs.io`'s MINDE within ΔE_OK 0.01, AND (b) bundle size is on the critical path.

---

## 3. Gamut probing — adopt CSS Color 4 MINDE

**Recommendation:** delete `lib/neutral-engine/gamutProbing.ts:maxInGamutChroma` and call `colorjs.io.toGamut({space, method:'css'})` directly via a thin helper.

**Measured deltas** (from `scripts/research/bench-gamut-probe.ts`):

| gamut | max \|ΔC\| (ours vs lib) | mean \|ΔC\| | lib speedup |
|---|---|---|---|
| sRGB | 0.051 | 0.010 | 2.3× |
| Display-P3 | 0.072 | 0.011 | 2.3× |
| Rec2020 | 0.061 | 0.013 | 1.7× |

Library returns more chroma because MINDE accepts colors whose nearest in-gamut neighbor is within ΔE_OK ≈ 0.02 — perceptually equivalent, even if not strictly inside the cube. Matches the canonical CSS Color 4 algorithm and is what production tools (Harmonizer, oklch.com) display.

**Replacement helper** (~12 lines, lives in `gamutProbing.ts`):

```ts
import Color from 'colorjs.io'

type GamutTarget = 'srgb' | 'p3' | 'rec2020'

export function maxChromaInGamut(L: number, H: number, gamut: GamutTarget, cMax = 0.5): number {
  const probe = new Color('oklch', [L, cMax, H])
  if (probe.inGamut(gamut)) return cMax
  const clamped = probe.toGamut({space: gamut, method: 'css'}).to('oklch')
  return clamped.coords[1] ?? 0
}
```

**Render-layer caveat.** Because MINDE allows colors slightly outside the cube, the eventual sRGB hex/rgb string returned by `serializeColor` must still go through `.toGamut('srgb')` at serialization time (already the case in `globalScale.ts:200-203`). No new clipping logic needed.

**Files affected.** `lib/neutral-engine/gamutProbing.ts` (replace internals of `maxInGamutChroma` and all `sweep*` helpers' inner loops). Public signatures stay stable so `gamutProbing.test.ts` should pass with adjusted expected values for the boundary samples.

---

## 4. Contrast architecture — APCA opt-in, WCAG default

**Recommendation:** new `lib/neutral-engine/contrastModel.ts` exposing a unified `computeContrast(fg, bg, model): ContrastReport`. Existing `contrast.ts` and `contrastTextOnBg` stay as the WCAG primitive used by `systemMap.findIndexForContrast` (called frequently, hot path). The new `contrastModel.ts` is the surface area for UI badges and the opt-in ramp-pick path.

**Measured APCA parity** (from `scripts/research/bench-apca-parity.ts`, 200 random pairs):
- polarity agreement: 200 / 200
- max |ΔLc|: 11.4 (mean 1.12)

Because APCA's ARC thresholds are at 15-unit intervals (Lc 30/45/60/75/90), ΔLc up to 11 means colorjs.io and apca-w3 can disagree on whether a pair *passes* a given threshold. **For ramp-pick math: use `apca-w3`.** For badge display where ±5 Lc rounding is acceptable: colorjs.io is fine.

**State location.** Add `contrastModel: ContrastModel` (and optional `contrastTargetModel`) to `useNeutralWorkbench` — not a separate hook. Default `'wcag-2.1'`. Toggle UI in `WorkbenchHeader` next to theme controls.

**Two-tier render strategy** (per Subagent B):
- Tier 1 (cheap): badges call `computeContrast(..., model)` — re-renders only consuming components.
- Tier 2 (opt-in): `findIndexForContrast` accepts `model + target`; flips invalidate `deriveSystemTokens`. Gate behind `contrastTargetModel` so existing ramps don't silently shift.

**Engine purity preserved.** `globalScale`, `effectiveMapping`, `semanticNaming`, `exportFormats` are untouched by the contrast model. `systemMap.findIndexForContrast` gains two parameters with backward-compatible defaults.

**Dependency.** `pnpm add apca-w3` — already added as a devDependency for the spike; promote to a runtime dep on implementation.

---

## 5. `chromaMode: 'max-in-gamut'` adoption

**Recommendation:** add `chromaMode: 'max-in-gamut'` (alongside existing `'achromatic' | 'fixed' | 'taper_mid' | 'taper_ends'`). Per-step:

```ts
const C_i = config.chromaMode === 'max-in-gamut'
  ? maxChromaInGamut(L_i, H_i, config.gamutTarget) * (config.chromaScale ?? 1)
  : chromaAtT(config.chromaMode, t_i, chromaAtLight, chromaAtDark)
```

**`gamutTarget` placement:** on `GlobalScaleConfig`, not export. Cached ladder *is* gamut-specific; putting it on export breaks the "exports are a view" invariant.

**Default:** follow `displayGamut.ts` runtime detection — P3 on capable monitors, sRGB otherwise. Designer can override per ramp via new control in CurvePanel or new ChromaPanel.

**Cache key update.** `cacheKeyForGlobalScale` (`globalScale.ts:105-126`) must include `gamutTarget` and `chromaScale`.

**UX surprise to design around.** In `'max-in-gamut'` mode, every L/H tweak shifts C per step; the existing chroma envelope sliders (`baseChroma`, `chromaLight`, `chromaDark`) become no-ops. UI must hide or disable them in this mode and surface `chromaScale ∈ [0, 1]` as the single user-facing chroma control.

---

## 6. Lightness distribution migration

**Recommendation:** discriminated `lightnessModel` field, default kind `'linear-oklch'`.

```ts
type LightnessModel =
  | {kind: 'linear-oklch'; lMax: number; lMin: number; midpoint?: number}
  | {kind: 'apca-anchored'; lMax: number; lMin: number; backgroundIdx: number; lcLadder: number[]}  // future
  | {kind: 'hct-tonal'; tones: number[]}                                                              // future
```

**Math for `linear-oklch`:** `L(i) = bezier(t(i), lMax, midpoint ?? (lMax + lMin) / 2, lMin)` — single-anchor quadratic Bezier in L-space. `midpoint < 0.5` biases toward more light steps; `> 0.5` toward more dark steps. Cites Huetone + Ottosson (OKLab 2020).

**Why not APCA-anchored as default.** Circular dependency: the engine generates both light and dark scales from one config — there is no canonical background to anchor against. W3C `Lc` formula has been retuned multiple times since 2022. Leave the union slot reserved.

**Schema bump from `v1` to `v2`.**

```ts
// lib/workbench/workbenchStorage.ts
function migrateV1ToV2(parsed: WorkbenchStateV1): WorkbenchStateV2 {
  const {lCurveStrength, lCurveStrengthA, lCurveStrengthB, pivotIndex, lCurve, lHigh, lLow, ...rest} = parsed.globalConfig
  // Map current behavior to linear-oklch with symmetric midpoint (no visible change for lCurveStrength=1.0).
  // Collapse dual-pivot into single midpoint = average; dev-only presetDebug warn if A !== B.
  const midpoint =
    lCurveStrengthA !== undefined || lCurveStrengthB !== undefined
      ? undefined // symmetric — dual pivot collapsed (warn in dev)
      : undefined
  return {
    schemaVersion: 2,
    globalConfig: {
      ...rest,
      lightnessModel: {kind: 'linear-oklch', lMax: lHigh, lMin: lLow, midpoint},
    },
    // ...contrastModel, gamutTarget, chromaScale defaults added here too (see §7)
  }
}
```

Runs in `lib/workbench/workbenchStorage.ts` parse path before state is handed to `useNeutralWorkbench`'s initializer. Idempotent. v1 reader retained one release for safety, then removed.

---

## 7. Single `v2` schema bump — combined deltas

All four changes (lightnessModel, contrastModel, chromaMode/gamutTarget, max-in-gamut) ship in **one** schema bump. Combined v2 additions to `GlobalScaleConfig` / workbench state:

```ts
// GlobalScaleConfig additions
lightnessModel: LightnessModel                 // §6 — replaces lHigh/lLow/lCurve*/pivotIndex
chromaMode: ChromaMode | 'max-in-gamut'        // §5 — additive
gamutTarget?: 'srgb' | 'p3' | 'rec2020'        // §5 — used iff chromaMode==='max-in-gamut'
chromaScale?: number                           // §5 — [0,1], default 1.0

// Workbench-state additions (not engine config)
contrastModel: 'apca' | 'wcag-2.1'             // §4, default 'wcag-2.1'
contrastTargetModel?: 'apca' | 'wcag-2.1'      // §4 — opt-in ramp-pick model
```

`cacheKeyForGlobalScale` must include the new engine fields.

---

## 8. UI/UX adoption from oklch.com / colordx.dev / Harmonizer

Patterns to adopt (annotated, not screenshot-tied):

- **Per-swatch gamut badges** (oklch.com pattern): existing `MultiGamutSample` already carries `inSrgb/inP3/inRec2020`. Surface as 3-state pill on each swatch in Inspector and PrimitivesPanel. No new engine work.
- **L · C · H · A breakdown** (colordx.dev pattern): Inspector already renders OKLCH coords at `Inspector.tsx:144`. Add alpha + display-gamut tier readout in the same row.
- **Cusp indicator** (Harmonizer pattern): when `chromaMode: 'max-in-gamut'`, render a thin cusp-line on the ramp preview at the (L_cusp, C_cusp) per hue. Out of scope for the engine — preview-only.
- **Live `Lc` overlay** (Huetone pattern): when `contrastModel: 'apca'`, render `Lc` between adjacent ramp swatches as a non-generative overlay. Decouples evaluation from generation.

---

## 9. Phased implementation plan

Each phase ends with a Plan Mode gate, verification (`pnpm type-check` → `pnpm test` → relevant `pnpm build`), and a breaking-change checklist. No phase mixes scope.

**Phase 1 — Gamut probe swap** (smallest, lowest risk; proves the toolchain)
- Replace `gamutProbing.maxInGamutChroma` internals with `toGamut({method:'css'})`. Public signature unchanged.
- Adjust `gamutProbing.test.ts` expected values at the boundary samples this spike identified.
- Verification: `pnpm test lib/neutral-engine/gamutProbing`, visual diff of ramp preview.

**Phase 2 — Lightness model + v2 storage migration**
- Add `lightnessModel` discriminated union to `GlobalScaleConfig`.
- Implement `'linear-oklch'` kind in `buildGlobalScale`. Keep old `lCurve`/`lCurveStrength`/dual-pivot fields readable for one release; the new path takes precedence when `lightnessModel` is set.
- Write `migrateV1ToV2` in `workbenchStorage.ts`. Snapshot tests against `{8, 11, 14, 24, 48}` step counts.
- Verification: full engine test suite, manual round-trip of every persisted preset.

**Phase 3 — Contrast model toggle**
- New `contrastModel.ts`, `apca-w3` runtime dependency.
- Add `contrastModel` to workbench state, header toggle.
- Update Inspector / ContrastPairsPanel to consume `computeContrast`.
- Defer the opt-in ramp-pick (`contrastTargetModel`) path to a separate sub-phase — high blast radius (changes `deriveSystemTokens` output).

**Phase 4 — `chromaMode: 'max-in-gamut'`**
- New `chromaMode` value + `gamutTarget` + `chromaScale` config fields.
- Cache key update in `cacheKeyForGlobalScale`.
- New ChromaPanel (or extend CurvePanel) for the `chromaScale` slider + `gamutTarget` selector.
- Verification: ramp visual diff across hues; perf check that 48-stop max-in-gamut builds stay under 16.67 ms.

**Phase 5 — UI polish**
- Gamut pills, alpha/L/C/H/A breakdown, cusp indicator, `Lc` overlay.
- All preview-only — no engine changes.

---

## 10. Risks & open questions

1. **Snapshot churn.** Phase 1 alone changes the chroma value of every ramp swatch near a gamut boundary. Any visual regression test or stored design asset will diff. Mitigate with a dedicated visual-regression review before Phase 2.
2. **APCA implementation drift.** `apca-w3` has been retuned multiple times; pin an exact version and document the revision (`0.0.98G-4g` or successor).
3. **`gamutTarget` following display detection.** On a designer's P3 monitor, ramps will be more saturated than on a teammate's sRGB monitor *for the same config*. Make this explicit in the UI — show the detected gamut next to the override.
4. **Dual-pivot users.** This week's `lCurveStrengthA/B + pivotIndex` work is being collapsed to a single midpoint. Anyone currently using asymmetric A ≠ B will see a behavior change at migration. Surface a one-time dev warning.
5. **Bundle audit not run.** The "keep colorjs.io" decision rests on perf data and a façade-cost argument, not bundle measurement. If a Lighthouse pass later flags it, the `colorjs.io/fn` switch is the answer.

---

## 11. Naming (parking lot)

The engine is no longer "neutral-only." Out of scope this pass — flag candidates only:

- `lib/color-engine/` — minimal change, accurate
- `lib/palette-engine/` — emphasizes multi-palette output
- `lib/oklch-system/` — emphasizes the canonical space

Recommend `lib/color-engine/` for any future rename. Defer rename until at least Phase 4 ships so the diff stays reviewable.
