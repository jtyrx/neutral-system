# Harmonizer & Huetone Behavioral Spec
## `generatePalette` Pseudocode

> **Status.** Research deliverable for the palette-generation spike. External claims are grounded in training knowledge of the public repos (evilmartians/harmonizer, ardov/huetone) — not live network fetches (denied at subagent runtime). Verified cross-references to SYNTHESIS.md §3 and §8 are noted inline. Treat source-level line citations as "directionally trustworthy, not pinned to a git SHA."

---

## 1. Harmonizer — APCA Lc targets per stop

### Stop naming

Harmonizer labels stops 100–900 (nine steps). Our build labels them 1–9. Mapping: `stop_number * 100 → our index`.

| Stop | Our idx | Light Lc target | Dark Lc target |
|------|---------|-----------------|----------------|
| 100  | 1       | 100             | 100            |
| 200  | 2       | 90              | 90             |
| 300  | 3       | 77              | 77             |
| 400  | 4       | 65              | 65             |
| 500  | 5       | 51              | 51             |
| 600  | 6       | 65              | 65             |
| 700  | 7       | 77              | 77             |
| 800  | 8       | 90              | 90             |
| 900  | 9       | 100             | 100            |

**Shape:** V-shaped (symmetric about stop 500). The lightest and darkest stops target Lc 100 (max legibility against opposite extreme); the midpoint (500) targets Lc 51. The sequence ascending from 100→500 is `100, 90, 77, 65, 51` and mirrors back `65, 77, 90, 100` for 600→900.

**Source.** The `APCA_TARGETS` (or equivalent) constant in `src/palette.ts` (evilmartians/harmonizer). The parent session confirmed these values from screenshots; training knowledge agrees with this shape. Exact source line: `src/palette.ts`, the array labeled something like `lightTargets`/`darkTargets` — both symmetric, identical sequence.

**Critical distinction for our build.** These Lc values are **evaluation targets, not generation inputs**. Harmonizer solves `L` from `Lc` via APCA inversion; we do the opposite — we fix `L` and compute `Lc` afterward for display. The Lc column above is the expected APCA output we can validate against after generation (a sanity-check scaffold, not a constraint).

**Reference background assumption.** Harmonizer uses white (`oklch(1 0 0)`) as the reference background for computing Lc at stops 100–500 and black (`oklch(0 0 0)`) for 600–900. Stop 500 is computed against whichever background yields higher |Lc|. This is an inferred convention from observable Harmonizer behavior — not confirmed from source.

---

## 2. Max chroma vs Even chroma — algorithmic difference

### `max` chroma

**Algorithm:** for each stop `i`, independently maximize chroma `C_i` to the gamut boundary at the stop's fixed `(L_i, H)`. Formally:

```
C_i = maxInGamutChroma(L_i, H, { targetSpace: gamut })
```

**Gamut boundary method:** CSS Color 4 MINDE — `colorjs.toGamut({space: gamut, method: 'css'})`. This is exactly what `maxInGamutChroma` in `lib/neutral-engine/gamutProbing.ts:24-37` does. SYNTHESIS.md §3 confirms Harmonizer uses MINDE and that our existing implementation already matches it.

**Consequence:** `C_i` varies across stops — stops near the OKLCH cusp (typically L ≈ 0.5–0.7 depending on hue) get the highest chroma; very light or very dark stops get less. The resulting palette is as vivid as possible at every lightness level, but the chroma envelope is uneven.

**Source.** `src/palette.ts` in evilmartians/harmonizer — the per-stop generation loop calls something equivalent to `toGamut({method: 'css'})` on an over-saturated probe color then reads `.oklch[1]` (the C coordinate).

### `even` chroma

**Algorithm:** choose a single chroma value `C_even` that is inside the gamut for **every** stop, then assign `C_i = C_even` uniformly across all stops.

**How `C_even` is determined in Harmonizer:** the minimum of all per-stop max chroma values, i.e., the bottleneck stop constrains the whole palette:

```
C_even = min(maxInGamutChroma(L_i, H, gamut) for i in 0..8)
```

The bottleneck is always the most extreme lightness stop (L near 0 or 1), where the gamut is narrowest.

**Consequence:** all stops share the same saturation level. The palette looks "flat" in chroma — more like a tonal scale than a vivid accent ramp. Useful for neutral-adjacent palettes or when perceptual consistency matters more than vibrancy.

**Source.** `src/palette.ts` — the `even` branch computes `minC` across all stops before the generation loop. This is consistent with the observable behavior of the Harmonizer UI when toggling between modes.

**Our mapping.** The locked architecture directly encodes this:
- `'max'` → per-stop `maxInGamutChroma(L_i, H, gamut)`
- `'even'` → `min(maxInGamutChroma(L_i, H, gamut) for all i)`, applied uniformly

---

## 3. Huetone — per-stop chroma manipulation

### UI primitives

Huetone exposes chroma as a **per-stop scalar input** — one chroma value per column in the grid. The grid is `palette × stop` (rows = palettes, columns = stops 1–12 in Huetone's default count). Each cell is independently editable with a direct `C` value; there is no global chroma slider.

Additionally, Huetone renders a **2D OKLCH gamut slice** (L on Y-axis, C on X-axis, at the palette's fixed hue) and overlays the current stop positions as dots. This visualization gives the designer an immediate affordance for how much "room" is left at each lightness level, making per-stop C edits feel informed rather than arbitrary.

### State model

```ts
// Inferred from ardov/huetone src/store/paletteStore.ts
type HuetoneColor = {
  L: number  // OKLCH lightness
  C: number  // OKLCH chroma — per-stop, mutable
  H: number  // fixed per palette
}

type HuetonePalette = {
  name: string
  hue: number
  colors: HuetoneColor[]  // array of length = stop count (default 12)
}
```

The state is a flat array of `{L, C, H}` per stop. There is no curve function or interpolation layer — each stop's `C` is stored directly. This is the key architectural difference from Harmonizer: Huetone gives the designer full per-stop freedom, while Harmonizer derives `C` from the chosen mode and leaves it non-editable.

### Gamut handling

Huetone does not automatically clamp `C` on edit. Instead:
1. It renders the gamut slice overlay so the designer can see when a dot "escapes" the boundary.
2. It flags out-of-gamut stops visually (a warning indicator).
3. The designer manually adjusts `C` to stay in-gamut if desired.

This is a "show, don't enforce" philosophy — appropriate for a manual design tool but not for a generative function like ours.

**Relevance to our build.** We do not adopt Huetone's per-stop free-C model for the initial pass. Our `chromaPolicy` (`'max'` or `'even'`) is a generator-level constraint. However, a future "manual override" mode could store a `number[] | null` per palette (null = use policy) in the same spirit as Huetone's state model.

### Lightness distribution

Huetone generates lightness as a **linear array** the designer edits directly — no Bezier, no APCA anchoring. SYNTHESIS.md §6 cites Huetone + Ottosson as motivation for the `linear-oklch` `lightnessModel` kind in the engine's v2 schema, specifically the idea that a quadratic Bezier in L-space approximates the designer's intent behind linear L arrays well.

---

## 4. `generatePalette` pseudocode

### Types

```ts
type OklchStop = {
  index: number            // 1–9
  L: number                // OKLCH L, [0,1]
  C: number                // OKLCH C, [0, ~0.4]
  H: number                // OKLCH H, [0, 360)
  hex: string              // sRGB hex, gamut-clipped
  oklchCss: string         // e.g. "oklch(0.65 0.18 264)"
  inSrgb: boolean
  inP3: boolean
  contrastOnWhite: { wcag: number; apca: number }
  contrastOnBlack: { wcag: number; apca: number }
  contrastOnSurface: { wcag: number; apca: number }  // surface.default = index 1
}

type GeneratePaletteOpts = {
  name: string
  hue: number              // OKLCH H, 0–360
  theme: 'light' | 'dark'
  gamut: 'srgb' | 'display-p3'
  chromaPolicy: 'max' | 'even'
  lightness: number[]      // length 9, theme-specific L values
}
```

### Pseudocode

```
function generatePalette(opts: GeneratePaletteOpts): OklchStop[] {

  // --- 0. Normalize gamut label for gamutProbing.ts ---
  // gamutProbing uses 'p3' internally; opts.gamut uses 'display-p3'
  const gamutTarget: OklchGamutTarget =
    opts.gamut === 'display-p3' ? 'p3' : 'srgb'

  // --- 1. Resolve chroma per stop ---
  //
  // Both policies start by computing the gamut-max chroma at each (L_i, H).
  // `maxInGamutChroma` from gamutProbing.ts uses MINDE via toGamut({method:'css'}).
  // This matches Harmonizer's max-chroma primitive exactly (SYNTHESIS §3).

  const maxChromaPerStop: number[] = opts.lightness.map((L) =>
    maxInGamutChroma(L, opts.hue, { targetSpace: gamutTarget })
  )

  let resolvedChroma: number[]

  if (opts.chromaPolicy === 'max') {
    // Each stop independently maximized — most vivid possible at each L
    resolvedChroma = maxChromaPerStop

  } else {
    // 'even': find the bottleneck stop (lowest max chroma across all 9),
    // apply that single C uniformly. Matches Harmonizer's 'even' mode.
    // Extreme stops (very light or very dark) are always the bottleneck.
    const C_even = Math.min(...maxChromaPerStop)
    resolvedChroma = Array(9).fill(C_even)
  }

  // --- 2. Build stops ---

  // surface.default is index 1 (first stop, lightest in light theme).
  // We resolve it first so contrastOnSurface can reference it.
  const surfaceL = opts.lightness[0]
  const surfaceC = resolvedChroma[0]
  const surfaceColor = new Color('oklch', [surfaceL, surfaceC, opts.hue])

  const stops: OklchStop[] = opts.lightness.map((L, i) => {
    const C = resolvedChroma[i]
    const H = opts.hue
    const color = new Color('oklch', [L, C, H])

    // Gamut membership (raw, pre-clip)
    const inSrgb = color.inGamut('srgb')
    const inP3  = color.inGamut('p3')

    // Serialize to sRGB for hex/css (clip to sRGB at render time, matching
    // the pattern in globalScale.ts:200-203 — SYNTHESIS §3 render-layer caveat)
    const srgbClamped = color.toGamut({ space: 'srgb', method: 'css' })
    const hex = srgbClamped.toString({ format: 'hex' })
    const oklchCss = `oklch(${round(L, 4)} ${round(C, 4)} ${round(H, 2)})`

    // --- Contrast calculations ---
    // WCAG 2.1: color.contrast(other, 'WCAG21')
    // APCA (display): color.contrast(other, 'APCA')
    //   Note: for ramp-pick math use apca-w3 (SYNTHESIS §4);
    //   for badge display colorjs.io APCA is acceptable (ΔLc ≤ 11, mean 1.12).

    const white = new Color('oklch', [1, 0, 0])
    const black = new Color('oklch', [0, 0, 0])

    const contrastOnWhite = {
      wcag: Math.abs(color.contrast(white, 'WCAG21')),
      apca: Math.abs(color.contrast(white, 'APCA')),
    }
    const contrastOnBlack = {
      wcag: Math.abs(color.contrast(black, 'WCAG21')),
      apca: Math.abs(color.contrast(black, 'APCA')),
    }
    const contrastOnSurface = {
      wcag: Math.abs(color.contrast(surfaceColor, 'WCAG21')),
      apca: Math.abs(color.contrast(surfaceColor, 'APCA')),
    }

    return {
      index: i + 1,   // 1-based
      L, C, H,
      hex,
      oklchCss,
      inSrgb,
      inP3,
      contrastOnWhite,
      contrastOnBlack,
      contrastOnSurface,
    }
  })

  return stops
}
```

### Notes on the pseudocode

1. **`maxInGamutChroma` is already the right primitive.** The existing implementation in `gamutProbing.ts:24-37` uses `toGamut({method:'css'})` — confirmed MINDE-compatible with Harmonizer (SYNTHESIS §3). No replacement needed for this pass.

2. **`surface.default` is stop index 1 (array index 0).** For light theme this is the lightest stop; for dark theme it is the darkest (blackest). This anchors `contrastOnSurface` as specified by the locked architecture.

3. **Dark theme L arrays are separate and independently solved.** `maxInGamutChroma` is called per-stop on the dark `L[9]`; the dark chroma envelope is different from the light one because gamut width varies with L.

4. **APCA values are display-only.** The Harmonizer Lc targets from §1 (`100, 90, 77, 65, 51, 65, 77, 90, 100`) are validation scaffolding — compare `stop.contrastOnWhite.apca` against these targets after generation to verify the L array is reasonable.

5. **`even` chroma bottleneck.** For most hues, stop index 1 (L ≈ 0.97 in light theme) or stop index 9 (L ≈ 0.15) will be the bottleneck. For blue at P3, the bottleneck is typically the darkest stop. For yellow/green, the cusp is high-L and the bottleneck is more nuanced — test both extremes.

---

## 5. Preset L arrays

Proposed concrete L values for six palettes, light and dark, informed by:
- **Primer's scale shape**: Primer's 9-stop functional palettes span roughly L 0.97→0.15 in light and 0.06→0.94 in dark, with mild compression at the extremes.
- **Harmonizer's output shape**: the V-curve Lc distribution implies L steps are non-linear in the perceptual midrange — more spacing near L 0.5 (the cusp region), less at extremes.
- **OKLCH perceptual uniformity**: unlike HSL, equal L steps in OKLCH are already perceptually uniform, so a simple linear interpolation from 0.97→0.15 is a reasonable first pass.

All palettes share the same L arrays (hue-independent in OKLCH lightness). Per-hue L tuning can be added later based on APCA validation output.

```ts
// lib/palette-engine/presetLightness.ts
// OKLCH L in [0, 1]. Index 0 = stop 1 (lightest in light, darkest in dark).

export const LIGHT_L: readonly number[] = [
  0.97,  // stop 1 — near-white surface
  0.93,  // stop 2
  0.87,  // stop 3
  0.78,  // stop 4
  0.66,  // stop 5 — cusp region, most chroma available
  0.54,  // stop 6
  0.42,  // stop 7
  0.30,  // stop 8
  0.18,  // stop 9 — near-black text
] as const

export const DARK_L: readonly number[] = [
  0.12,  // stop 1 — near-black surface in dark theme
  0.18,  // stop 2
  0.26,  // stop 3
  0.36,  // stop 4
  0.48,  // stop 5
  0.60,  // stop 6
  0.72,  // stop 7
  0.84,  // stop 8
  0.94,  // stop 9 — near-white text in dark theme
] as const

// Per-palette overrides (all start as aliases; tune after APCA validation).
// Key insight: hue does NOT shift L in OKLCH (unlike HCT tonal palettes).
// These are starting points — adjust stop 5 per hue if the cusp sits off-center.

export const PALETTE_LIGHT_L: Record<string, readonly number[]> = {
  blue:   LIGHT_L,
  green:  LIGHT_L,
  orange: LIGHT_L,
  yellow: LIGHT_L,
  red:    LIGHT_L,
  purple: LIGHT_L,
} as const

export const PALETTE_DARK_L: Record<string, readonly number[]> = {
  blue:   DARK_L,
  green:  DARK_L,
  orange: DARK_L,
  yellow: DARK_L,
  red:    DARK_L,
  purple: DARK_L,
} as const
```

### Rationale for specific values

| Stop | Light L | Dark L | Rationale |
|------|---------|--------|-----------|
| 1    | 0.97    | 0.12   | Extreme stops — near-white/black. More compression here, less differentiation needed. |
| 5    | 0.66    | 0.48   | Cusp region for most hues. Highest chroma available. Lc ~51 against white/black expected. |
| 9    | 0.18    | 0.94   | Opposite extreme — text-weight stop. High Lc (~100) against white/black expected. |

**Validation gate:** after running `generatePalette` for each palette at `hue` + `gamut: 'display-p3'` + `chromaPolicy: 'max'`, check `contrastOnWhite.apca` at each stop against the Harmonizer Lc targets (§1). If stop 5 falls below Lc 45 for any palette, compress the L array slightly around index 5. If stop 1/9 fall below Lc 90, move the extreme stops toward 1.0/0.0 respectively.

---

## Cross-references

| Claim | Source |
|-------|--------|
| MINDE matches Harmonizer output | SYNTHESIS.md §3, measured ΔC benchmark |
| `maxInGamutChroma` already uses `toGamut({method:'css'})` | `gamutProbing.ts:34-36` |
| APCA is display-only, not generative | Architecture lock (parent session), SYNTHESIS.md §4 |
| `surface.default` = index 1 in neutral ramp | Architecture lock (parent session), SYNTHESIS.md §8 |
| Huetone uses per-stop C array state | Training knowledge of `ardov/huetone src/store/paletteStore.ts` |
| Harmonizer APCA targets symmetric V-shape | Parent session screenshots + training knowledge of `evilmartians/harmonizer src/palette.ts` |
| Dark ramp maxChroma solved independently | Architecture lock (parent session) |
| `even` chroma = `min(maxChroma per stop)` | Inferred from Harmonizer observable behavior + training knowledge |
