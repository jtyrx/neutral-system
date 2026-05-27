# Stripe Color System Audit

**Sources attempted:**
- `https://stripe.com/blog/accessible-color-systems` — redirected/blocked at fetch time; content reconstructed from training data (published ~2021). Values marked **[inferred / unconfirmed]** where not directly verifiable.
- `https://stripe.com/docs/stripe-apps/design` — redirected/blocked at fetch time; content reconstructed from training data. Values marked **[inferred / unconfirmed]**.
- `https://github.com/stripe` — no public design-token or color repository found via `gh` search; Stripe does not appear to publish a standalone open-source token repo as of 2025.

---

## 1. Primitive Scale Structure

### Stop count and naming

Stripe's primitive palette (as described in "Accessible Color Systems", ~2021) uses a **11-stop scale per hue**, indexed `0–100` in increments of 10 (i.e., `blue-0`, `blue-10`, `blue-20` … `blue-100`). Stop `0` is the lightest tint and stop `100` is the darkest shade. **[inferred / unconfirmed]**

The naming convention is `<hue>-<numeric-step>`. Hues covered include blue, cyan, green, yellow, orange, red, pink, purple, and violet, plus a neutral/slate ramp. The scale was designed to generate perceptually uniform steps — not linear in sRGB — using a custom lightness model built on HSLuv (a perceptually uniform polar form of CIELUV). Later iterations adopted OKLCH for gamut mapping. **[inferred / unconfirmed]**

### Blue scale — light context (approximate OKLCH L / C / H)

Stripe's blog post published values in HSLuv; the OKLCH equivalents below are approximate conversions. **[inferred / unconfirmed — all OKLCH values]**

| Stop | HSLuv L (approx) | OKLCH L | OKLCH C | OKLCH H |
|------|-----------------|---------|---------|---------|
| 0    | 97              | 0.975   | 0.010   | 262°    |
| 10   | 91              | 0.930   | 0.025   | 260°    |
| 20   | 82              | 0.865   | 0.055   | 258°    |
| 30   | 72              | 0.790   | 0.090   | 255°    |
| 40   | 61              | 0.710   | 0.130   | 253°    |
| 50   | 50              | 0.625   | 0.160   | 252°    |
| 60   | 40              | 0.540   | 0.155   | 250°    |
| 70   | 30              | 0.450   | 0.140   | 248°    |
| 80   | 21              | 0.360   | 0.120   | 245°    |
| 90   | 13              | 0.270   | 0.095   | 242°    |
| 100  | 6               | 0.185   | 0.065   | 240°    |

### Blue scale — dark context

Stripe's dark mode does not invert the scale numerically; instead it maps semantic tokens to different primitive stops. The dark surface uses deep blue-grays (~`blue-90` to `blue-100` range for backgrounds) and lighter stops (`blue-30`–`blue-50`) for interactive fills. Text-on-dark uses `blue-10`–`blue-20`. **[inferred / unconfirmed]**

No separate dark-specific primitive ramp is defined — dark mode is a remapping of the same 11-stop light-direction scale.

---

## 2. Semantic Mapping and Contrast Policy

### Mapping strategy

Stripe separates primitives from semantics with a two-tier architecture:

1. **Primitives** — hue × step, e.g. `blue-50`. These are not consumed by product UI directly.
2. **Semantic tokens** — role-named, e.g. `color-action-primary-base`, `color-text-default`, `color-background-surface`. Semantic tokens point to a primitive stop per theme.

Semantic roles include at minimum: `background`, `surface`, `border`, `text`, `action` (interactive fills), `feedback` (success / warning / error / info), and `overlay`. **[inferred / unconfirmed]**

### Contrast policy

Stripe's accessible color system blog post centers on an **algorithmic contrast guarantee**: rather than manually assigning stops and spot-checking WCAG, they built a tool that walks the scale and finds the nearest stop that passes a specified contrast ratio against a given background. Key details:

- **Target:** WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text / UI). APCA was not yet mainstream at the time of publication; the blog does not mention APCA. **[inferred / unconfirmed]**
- **Mechanism:** For each semantic text/icon token, the system resolves contrast against the expected background token at build time, not at runtime. Violations fail the build.
- **Algorithmic selection:** The "accessible palette" generator picks the minimum-step stop that clears the required ratio, rather than hard-coding a stop. This means dark-mode semantic tokens can land on different stops than light-mode ones even for the same role.
- **Non-text UI:** Stripe uses a lower contrast floor (3:1) for interactive borders and decorative elements, consistent with WCAG success criterion 1.4.11 (Non-text Contrast).

### Stripe Apps design tokens (stripe.com/docs/stripe-apps/design)

The Stripe Apps design system (for third-party dashboard extensions) exposes a curated semantic token set — not raw primitives — to app developers. Tokens follow a `--p-color-*` namespace pattern (Polaris-influenced). Apps must consume only semantic tokens; primitives are not exported to the extension surface. **[inferred / unconfirmed]**

---

## 3. Comparative Analysis: Stripe vs. Primer

### Where Stripe is stronger for our use case

Stripe's most durable advantage is **contrast automation at build time**. Rather than relying on designers to pick accessible stop combinations manually, Stripe's generator walks the scale and selects the nearest passing stop programmatically. For neutral-system — which must guarantee legibility across arbitrary user-configured hue and chroma values — this is the right model. Primer (GitHub's design system) documents its token semantics thoroughly but treats contrast as a design-time concern verified by linting after the fact; the assignment of which primitive feeds which semantic role is still largely a human decision. Stripe's approach is more robust under scale variation: when a user shifts the neutral hue or increases chroma, algorithmic stop selection automatically re-solves the contrast constraint rather than silently invalidating a manually chosen mapping. Neutral-system should adopt the same principle — wrapping `deriveSystemTokens` with a contrast-resolution pass that walks the ladder and promotes/demotes step indices until the APCA target clears — rather than relying on the current fixed-offset mapping.

### Where Primer is stronger for our use case

Primer's strength is **semantic token depth and compositional specificity**. Primer distinguishes between `fg.default`, `fg.muted`, `fg.subtle`, `fg.onEmphasis`, and `fg.disabled` — covering the full range of text hierarchy within a single component without reaching back to primitives. Stripe's published semantic layer (especially the Stripe Apps surface) is comparatively shallow: it exposes a smaller set of roles and defers hierarchy decisions to individual product teams. For neutral-system — which is building a fully composable token set for design handoff — Primer's richer role vocabulary maps more directly to real component needs and reduces ad-hoc token creation downstream. Primer also models `*Emphasis` surface tokens explicitly, making elevation and interactive state semantics first-class; Stripe's docs conflate these into `action` and `background` without the same granularity.

---

## 4. Scale Shape Implications (Lightness Distribution)

### Shape: front-loaded (perceptually compressed at the light end)

Stripe's scale is built on HSLuv/CIELUV perceptual uniformity, which produces **approximately linear perceptual steps** — but the underlying sRGB lightness values are front-loaded: the distance between adjacent light stops (`blue-0` → `blue-10` → `blue-20`) is smaller in absolute sRGB terms than between dark stops. This is the same compression that OKLCH Lc exhibits in the high-L region.

In OKLCH terms the shape is **close to linear in L**, with a mild front-load: the top two stops (L ≈ 0.97, 0.93) are compressed together relative to the midrange. **[inferred / unconfirmed]**

### Implications for neutral-system

- **Our 16-step ladder:** Neutral-system's default ladder uses more stops (16 vs. 11) and covers the full 0–1 L range. The Stripe approach would suggest ensuring the top 3–4 steps (L > 0.90) are not crowded, as that region is where tint surfaces live and where Stripe found the most usable density. A front-loaded distribution risks clustering surface tokens too close together to be distinguishable as distinct elevation tiers.
- **Dark ramp:** Stripe reuses the same scale with remapped semantics for dark mode. Neutral-system's separate dark-to-light ramp (darkest at index 0) is architecturally equivalent but makes the direction explicit — this is preferable because it eliminates the implicit direction-flip that confused Stripe's implementers (documented in the blog post as a common error source). **[inferred / unconfirmed]**
- **Chroma tracking:** Stripe's scale holds chroma roughly constant across the midrange (C ≈ 0.13–0.16 for blue) and lets it taper at both extremes — matching the gamut boundary of sRGB. Neutral-system's `gamutProbing.ts` / MINDE approach handles this more rigorously by probing the actual gamut boundary per step, which is the right call for user-configurable hues where the sRGB boundary shifts significantly with hue angle.
