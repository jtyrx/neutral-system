# Primer Design System — Color Audit

**Source:** `github.com/primer/primitives` (main branch, fetched 2026-05-26)
**Themes audited:** Default light, Default dark
**Color space for analysis:** OKLCH (converted from source HSL/hex via D65 XYZ → OKLab pipeline)

---

## 1. Primitive Scale Values in OKLCH

Primer defines primitive scales as base tokens under `src/tokens/base/color/`. Each scale has 10 stops (indices 0–9) except Neutral which has 12 (indices 1–12 in light, 1–12 in dark). All scales authored in HSL internally; hex values are canonical in the token files.

### 1a. Neutral — Light (`base.color.neutral.*`)

| Stop | Hex       | OKLCH L  | OKLCH C  | OKLCH H   |
|------|-----------|----------|----------|-----------|
| 0    | #ffffff   | 100.00%  | 0.000%   | —         |
| 1    | #F6F8FA   | 97.82%   | 0.350%   | 248.2°    |
| 2    | #EFF2F5   | 95.97%   | 0.523%   | 248.1°    |
| 3    | #E6EAEF   | 93.54%   | 0.809%   | 254.0°    |
| 4    | #E0E6EB   | 92.18%   | 0.946%   | 243.0°    |
| 5    | #DAE0E7   | 90.42%   | 1.163%   | 252.2°    |
| 6    | #D1D9E0   | 88.12%   | 1.306%   | 244.4°    |
| 7    | #C8D1DA   | 85.65%   | 1.597%   | 248.1°    |
| 8    | #818B98   | 63.29%   | 2.283%   | 255.0°    |
| 9    | #59636E   | 49.51%   | 2.157%   | 250.8°    |
| 10   | #454C54   | 41.32%   | 1.622%   | 251.8°    |
| 11   | #393F46   | 36.48%   | 1.455%   | 252.3°    |
| 12   | #25292E   | 27.90%   | 1.089%   | 254.0°    |
| 13   | #1f2328   | 24.30%   | 1.290%   | 251.7°    |

**Note:** There is a lightness gap between stops 7 and 8 (85.65% → 63.29%, a drop of 22pp). Stops 1–7 form a tight cloud for subtle backgrounds; stops 8–13 are the text/icon range. Chroma peaks at stop 8 (2.283%) then contracts toward black.

### 1b. Neutral — Dark (`base.color.neutral.*`)

| Stop | Hex       | OKLCH L  | OKLCH C  | OKLCH H   |
|------|-----------|----------|----------|-----------|
| 1    | #0D1117   | 17.63%   | 1.404%   | 258.4°    |
| 2    | #151B23   | 21.98%   | 1.817%   | 255.7°    |
| 3    | #212830   | 27.35%   | 1.795%   | 251.9°    |
| 4    | #262C36   | 29.16%   | 2.022%   | 260.6°    |
| 5    | #2A313C   | 31.12%   | 2.212%   | 259.4°    |
| 6    | #2F3742   | 33.39%   | 2.236%   | 256.4°    |
| 7    | #3D444D   | 38.37%   | 1.796%   | 254.8°    |
| 8    | #656C76   | 52.87%   | 1.794%   | 257.3°    |
| 9    | #9198A1   | 67.69%   | 1.559%   | 254.7°    |
| 10   | #B7BDC8   | 79.70%   | 1.696%   | 262.7°    |
| 11   | #D1D7E0   | 87.72%   | 1.408%   | 258.4°    |
| 12   | #F0F6FC   | 97.03%   | 1.036%   | 248.1°    |

Dark neutral is a separate, independently authored scale — not an inversion of the light scale. Chroma is highest in the 4–6 range (surface backgrounds) and contracts toward both extremes.

### 1c. Chromatic Scales — Light (all 10-stop, index 0 = lightest)

#### Blue

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #ddf4ff   | 95.36%   | 2.846%    | 228.1°    |
| 1    | #b6e3ff   | 89.34%   | 6.069%    | 235.7°    |
| 2    | #80ccff   | 81.49%   | 10.459%   | 239.2°    |
| 3    | #54aeff   | 73.11%   | 14.625%   | 248.4°    |
| 4    | #218bff   | 64.17%   | 19.515%   | 255.0°    |
| 5    | #0969da   | 53.99%   | 19.065%   | 257.5°    |
| 6    | #0550ae   | 45.09%   | 16.419%   | 258.2°    |
| 7    | #033d8b   | 37.90%   | 14.120%   | 258.7°    |
| 8    | #0a3069   | 32.10%   | 10.848%   | 259.1°    |
| 9    | #002155   | 26.35%   | 10.221%   | 259.0°    |

#### Green

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #dafbe1   | 95.74%   | 4.865%    | 151.7°    |
| 1    | #aceebb   | 89.15%   | 9.639%    | 151.2°    |
| 2    | #6fdd8b   | 81.19%   | 15.401%   | 150.1°    |
| 3    | #4ac26b   | 72.57%   | 16.426%   | 149.5°    |
| 4    | #2da44e   | 63.43%   | 16.194%   | 148.4°    |
| 5    | #1a7f37   | 52.44%   | 14.007%   | 148.1°    |
| 6    | #116329   | 43.91%   | 11.792%   | 148.1°    |
| 7    | #044f1e   | 37.41%   | 10.417%   | 148.5°    |
| 8    | #003d16   | 31.44%   | 8.812%    | 149.3°    |
| 9    | #002d11   | 26.00%   | 6.981%    | 151.1°    |

#### Red

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #ffebe9   | 95.55%   | 2.197%    | 24.3°     |
| 1    | #ffcecb   | 89.31%   | 5.580%    | 22.3°     |
| 2    | #ffaba8   | 82.20%   | 9.953%    | 21.7°     |
| 3    | #ff8182   | 74.63%   | 15.361%   | 20.9°     |
| 4    | #fa4549   | 65.68%   | 21.700%   | 24.4°     |
| 5    | #cf222e   | 55.18%   | 20.508%   | 24.5°     |
| 6    | #a40e26   | 45.91%   | 17.765%   | 21.9°     |
| 7    | #82071e   | 38.71%   | 15.065%   | 20.8°     |
| 8    | #660018   | 32.33%   | 12.955%   | 18.4°     |
| 9    | #4c0014   | 26.49%   | 10.586%   | 14.7°     |

#### Orange

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #fff1e5   | 96.59%   | 2.193%    | 63.1°     |
| 1    | #ffd8b5   | 90.66%   | 6.340%    | 63.8°     |
| 2    | #ffb77c   | 83.44%   | 11.246%   | 59.7°     |
| 3    | #fb8f44   | 75.34%   | 15.721%   | 52.4°     |
| 4    | #e16f24   | 66.53%   | 16.376%   | 48.8°     |
| 5    | #bc4c00   | 55.73%   | 16.004%   | 44.7°     |
| 6    | #953800   | 46.57%   | 13.703%   | 43.3°     |
| 7    | #762c00   | 39.53%   | 11.459%   | 44.2°     |
| 8    | #5c2200   | 33.39%   | 9.484%    | 45.4°     |
| 9    | #471700   | 27.75%   | 8.092%    | 43.8°     |

#### Yellow

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #fff8c5   | 97.22%   | 6.577%    | 101.0°    |
| 1    | #fae17d   | 90.99%   | 12.342%   | 95.7°     |
| 2    | #eac54f   | 83.42%   | 14.007%   | 91.5°     |
| 3    | #d4a72c   | 74.98%   | 14.066%   | 87.1°     |
| 4    | #bf8700   | 66.19%   | 13.734%   | 79.3°     |
| 5    | #9a6700   | 55.42%   | 11.686%   | 75.0°     |
| 6    | #7d4e00   | 46.65%   | 10.090%   | 70.2°     |
| 7    | #633c01   | 39.37%   | 8.521%    | 68.9°     |
| 8    | #4d2d00   | 32.98%   | 7.218%    | 68.3°     |
| 9    | #3b2300   | 28.03%   | 6.016%    | 71.5°     |

#### Purple

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #fbefff   | 96.61%   | 2.470%    | 317.6°    |
| 1    | #ecd8ff   | 91.05%   | 5.657%    | 308.3°    |
| 2    | #d8b9ff   | 83.62%   | 10.130%   | 304.5°    |
| 3    | #c297ff   | 75.64%   | 15.088%   | 302.0°    |
| 4    | #a475f9   | 66.90%   | 19.032%   | 297.4°    |
| 5    | #8250df   | 56.31%   | 20.696%   | 295.0°    |
| 6    | #6639ba   | 47.43%   | 19.090%   | 293.8°    |
| 7    | #512a97   | 40.24%   | 16.681%   | 293.9°    |
| 8    | #3e1f79   | 33.97%   | 14.301%   | 292.9°    |
| 9    | #2e1461   | 28.34%   | 12.592%   | 291.7°    |

#### Pink

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #ffeff7   | 96.70%   | 2.013%    | 345.4°    |
| 1    | #ffd3eb   | 91.12%   | 5.799%    | 344.3°    |
| 2    | #ffadda   | 83.95%   | 11.063%   | 345.7°    |
| 3    | #ff80c8   | 76.47%   | 17.341%   | 346.8°    |
| 4    | #e85aad   | 67.59%   | 19.531%   | 347.4°    |
| 5    | #bf3989   | 56.55%   | 18.707%   | 348.0°    |
| 6    | #99286e   | 47.67%   | 16.408%   | 347.1°    |
| 7    | #772057   | 40.13%   | 13.429%   | 346.0°    |
| 8    | #611347   | 34.23%   | 12.357%   | 344.8°    |
| 9    | #4d0336   | 28.28%   | 11.565%   | 345.2°    |

#### Coral

| Stop | Hex       | OKLCH L  | OKLCH C   | OKLCH H   |
|------|-----------|----------|-----------|-----------|
| 0    | #fff0eb   | 96.56%   | 1.757%    | 39.2°     |
| 1    | #ffd6cc   | 90.82%   | 4.814%    | 33.9°     |
| 2    | #ffb4a1   | 83.60%   | 9.208%    | 34.7°     |
| 3    | #fd8c73   | 75.75%   | 14.238%   | 33.5°     |
| 4    | #ec6547   | 67.02%   | 17.358%   | 34.0°     |
| 5    | #c4432b   | 56.12%   | 16.911%   | 32.7°     |
| 6    | #9e2f1c   | 47.17%   | 15.001%   | 32.2°     |
| 7    | #801f0f   | 39.82%   | 13.446%   | 32.0°     |
| 8    | #691105   | 33.89%   | 12.303%   | 31.4°     |
| 9    | #510901   | 28.13%   | 10.450%   | 32.0°     |

---

## 2. Hue-Drift Policy

Primer does **not** enforce a fixed-hue constraint across scale stops. Scales are authored in HSL and hue movement across stops is intentional and unguarded. In OKLCH (a perceptually uniform space), the actual drift patterns are:

### Neutral — hue is loosely constant, not pinned

Light neutral hue spans **243°–255°** across the 12 stops with no monotonic trend. The hue variation (≈12°) is low-chroma noise rather than a deliberate arc — at chroma values of 0.35%–2.3%, a 12° hue shift is perceptually negligible (ΔE < 0.5 in most stops). The dark neutral similarly clusters **248°–263°** with the same character.

**Conclusion for neutral:** Hue is not explicitly locked but the low-chroma authoring strategy means perceived hue is effectively stable. No counter-hue compensation (e.g., warm-shadows in cool grays) is applied.

### Chromatic scales — hue arc is scale-dependent

| Scale  | Stop 0 H  | Stop 9 H  | Drift  | Direction         |
|--------|-----------|-----------|--------|-------------------|
| Blue   | 228.1°    | 259.0°    | +30.9° | Shifts blue→indigo toward darks |
| Green  | 151.7°    | 151.1°    | −0.6°  | Near-zero drift — exceptionally stable |
| Red    | 24.3°     | 14.7°     | −9.6°  | Pulls toward orange-red at lights, toward crimson at darks |
| Orange | 63.1°     | 43.8°     | −19.3° | Shifts from yellow-orange (lights) to red-orange (darks) |
| Yellow | 101.0°    | 71.5°     | −29.5° | Large drift: yellow-green at lightest → amber-gold at darkest |
| Purple | 317.6°    | 291.7°    | −25.9° | Magenta at lights → blue-violet at darks |
| Pink   | 345.4°    | 345.2°    | −0.2°  | Near-zero drift — stable red-pink throughout |
| Coral  | 39.2°     | 32.0°     | −7.2°  | Minor shift, orange-red throughout |

**Key observation:** Primer does not pursue constant-hue or constant-chroma across a scale. Blue and Yellow have the most aggressive hue arcs (~30°), which is characteristic of maximizing sRGB gamut utilization — staying near the gamut boundary forces hue rotation as lightness changes. Green and Pink happen to be nearly constant-hue, but this is a byproduct of their perceptual position in sRGB rather than a policy choice.

**Chroma shape:** All chromatic scales follow an inverted-U or monotone-decrease chroma profile: chroma rises from very low at the light end to a peak around stops 3–5, then contracts as the scale darkens (sRGB gamut constraint). No scale attempts to maintain constant chroma (as OKLCH-first authoring would). Peak chroma ranges from ~14% (Coral, Orange) to ~21% (Blue, Red, Purple).

**No documented hue-drift policy exists in the Primer token authoring guidelines.** The `DESIGN_TOKENS_GUIDE.md` specifies token usage rules (WCAG ratios, pairing rules) but contains no language about hue management, gamut mapping, or perceptual uniformity. Hue is a byproduct of HSL authoring and sRGB gamut constraints, not an explicit design intention.

---

## 3. Semantic Layer Structure

Primer separates tokens into two layers: **base/primitive** (`src/tokens/base/`) and **functional/semantic** (`src/tokens/functional/`).

### 3a. Naming Convention

Functional tokens follow a compound naming pattern:

```
--{category}-{variant?}-{property}-{state?}
```

Examples:
- `--fgColor-default` — foreground, no variant, default state
- `--bgColor-accent-emphasis` — background, accent semantic, emphasis intensity
- `--bgColor-danger-muted` — background, danger semantic, muted intensity
- `--borderColor-neutral-emphasis` — border, neutral semantic, emphasis intensity
- `--button-primary-bgColor-rest` — component (button), variant (primary), bg, state (rest)

### 3b. Semantic Categories (functional color tokens)

**Foreground (`fgColor.*`):**
- `default` → neutral.13 (primary text, headings)
- `muted` → neutral.9 (secondary text, metadata)
- `onEmphasis` → neutral.0 (text on colored emphasis backgrounds)
- `disabled` → neutral.8
- `link` / `accent` → blue.5
- `success` / `open` → green.5
- `danger` / `closed` → red.5 (resolved to #d1242f, between red.4 and red.5)
- `attention` → yellow.5
- `severe` → orange.5
- `done` / `upsell` → purple.5
- `sponsors` → pink.5
- `draft` / `neutral` → neutral.9
- `white`, `black`, `onInverse` — absolute values

**Background (`bgColor.*`):**
- `default` → neutral.0 (page canvas)
- `muted` → neutral.1 (secondary surfaces, code blocks, sidebars)
- `inset` → alias of bgColor.muted (recessed panels, wells)
- `emphasis` → neutral.12 (strong neutral emphasis)
- `inverse` → neutral.12
- `disabled` → neutral.2
- Per-semantic pairs (`accent`, `success`, `danger`, `attention`, `severe`, `done`, `open`, `closed`, `sponsors`, `upsell`, `neutral`, `draft`), each with:
  - `-emphasis` → scale stop 5 (the "action" or "solid" color)
  - `-muted` → scale stop 0 (the tinted background variant)

**Border (`borderColor.*`):**
- `default` → neutral.6
- `muted` → alias of default (lighter separator contexts)
- `emphasis` → neutral.8
- Per-semantic pairs with `-emphasis` (stop 5) and `-muted` (stop 3, with alpha: `66` hex = 40% opacity)

### 3c. Intensity Axis: muted / default / emphasis

Primer uses a three-point intensity axis within each semantic:

| Intensity   | Role                                           | Example (accent)              |
|-------------|------------------------------------------------|-------------------------------|
| `muted`     | Tinted background, low-contrast surface        | `#ddf4ff` (blue.0)            |
| *(default)* | Standard usage (no suffix)                     | `#0969da` (blue.5, fg/border) |
| `emphasis`  | Solid fill, inverted text on top               | `#0969da` (blue.5, bg button) |

For backgrounds, `-muted` maps to scale stop 0 (near-white tint) and `-emphasis` maps to stop 5 (the full-saturation color). Foreground and border tokens do not use this axis — they resolve to a single stop (5 or thereabouts).

### 3d. Component (Pattern) Layer

A third tier wraps semantic tokens into component-specific slots: `--button-{variant}-{property}-{state}`, `--control-{property}-{state}`. These never reference primitive hex values directly — they reference functional tokens or layer additional state logic (hover, active, disabled, selected).

### 3e. Dark-mode overrides

All functional tokens carry dark-mode values in `org.primer.overrides`. Overrides reference different base scale stops (not inverted indices): e.g., `bgColor.default` is `neutral.0` in light and `neutral.1` in dark. This is per-token override, not a global scale inversion.

---

## 4. Accessibility Methodology

### 4a. Contrast Standard: WCAG 2.x AA

Primer's documented accessibility requirements (from `DESIGN_TOKENS_GUIDE.md` and the Figma token metadata `org.primer.llm.rules`) are **WCAG 2.x AA** only:

| Text context            | Required ratio | Standard    |
|-------------------------|----------------|-------------|
| Normal text (< 18pt)    | 4.5:1          | WCAG 2 AA   |
| Large text / UI element | 3:1            | WCAG 2 AA   |

APCA is **not** used in Primer Primitives as of this audit. No APCA Lc values appear in token metadata or documentation. The `DESIGN_TOKENS_GUIDE.md` is explicit about 4.5:1 and 3:1 as the only thresholds.

### 4b. High-Contrast Themes

Primer ships four additional themes beyond the default pair:

- `light.high-contrast` — light theme with tighter token-to-scale mappings (e.g., `fgColor.muted` shifts from neutral.9 to neutral.10–11, border tokens shift to neutral.10)
- `dark.high-contrast` — dark theme with equivalent adjustments
- `dark.dimmed` — reduced-contrast dark theme (gentler backgrounds, used by GitHub's dimmed preference)
- `dark.dimmed.high-contrast` — dimmed palette with HC overrides

High-contrast themes are implemented as per-token overrides on the same functional layer — not separate token files. A token like `fgColor.muted` carries its HC value inline under `org.primer.overrides['light-high-contrast']`.

### 4c. Semantic Pairing Rules

The `DESIGN_TOKENS_GUIDE.md` enforces hard pairing constraints to guarantee contrast:

| Background             | Required foreground      | Reason                                          |
|------------------------|-------------------------|-------------------------------------------------|
| `bgColor-*-emphasis`   | `fgColor-onEmphasis`    | Emphasis fills are saturated; white text only   |
| `bgColor-*-muted`      | `fgColor-{semantic}`    | Muted fills are near-white; use semantic fg     |
| `bgColor-default`      | `fgColor-default`       | Standard page pairing                           |
| `bgColor-muted`        | `fgColor-default`       | `fgColor-muted` is explicitly disallowed here   |

These rules are enforced through LLM metadata (`org.primer.llm.rules`) — they are documentation constraints, not build-time checks.

### 4d. Colorblind / Vision Accommodation

Primer ships three additional high-contrast themes for color vision deficiencies:
- `light-tritanopia-high-contrast`
- `light-protanopia-deuteranopia-high-contrast`
- `dark-tritanopia-high-contrast`
- `dark-protanopia-deuteranopia-high-contrast`

These remap semantic tokens (particularly `danger`, `success`, `attention`) to alternative hues or higher-contrast stops to remain distinguishable under simulated CVD. No structural changes to the primitive scales; overrides happen at the functional layer.

### 4e. Focus

A dedicated `--focus-outlineColor` token (`#0969da` in light, blue.5) is used exclusively for keyboard focus rings. No contrast ratio is documented for focus indicators specifically, though WCAG 2.2 SC 1.4.11 (non-text contrast, 3:1 against adjacent colors) would apply.

---

## Summary Observations for Neutral System

1. **Scale density:** Primer neutral has 12 stops with a significant gap at the midpoint (stops 7→8 in light, a 22pp lightness jump). Primer uses the lower half for surfaces and the upper half for text, never mixing them. Neutral System's uniform ladder avoids this structural gap.

2. **Hue approach:** Primer makes no commitment to perceptual hue stability. Its neutral is lightly blue-shifted (248°–255°) with no documented intent. Chromatic scales drift freely by up to 30° across their range, driven by sRGB gamut shape. This contrasts with Neutral System's gamut-probed, hue-constant approach.

3. **Semantic intensity axis:** The `muted` / `emphasis` axis (stop 0 vs. stop 5) is a clean two-point model. Neutral System's token model covers similar ground with `subtle`/`default`/`emphasis` border tiers and surface-tier distinctions.

4. **Accessibility:** Primer is firmly WCAG 2 AA. No APCA adoption despite GitHub's engineering resources. High-contrast themes expand coverage but are implemented as opt-in overrides, not baked into the default scale.

5. **Token authoring format:** Primer uses JSON5 + Style Dictionary. Per-token dark overrides (not a separate dark file) give fine-grained control but create significant token-file verbosity. Neutral System's approach of theme-directed scale indices with CSS variable scoping is architecturally lighter.
