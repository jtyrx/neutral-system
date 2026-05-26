---
name: Neutral System Builder
description: Precision workbench for building OKLCH-based neutral color systems and semantic design tokens.
colors:
  calibration-orange: "oklch(69.3% 0.2546 37.91)"
  neutral-canvas-dark: "oklch(16.15% 0 0)"
  neutral-surface-dark: "oklch(18.21% 0 0)"
  neutral-raised-dark: "oklch(22.33% 0 0)"
  neutral-text-dark: "oklch(96.44% 0 0)"
  neutral-text-muted-dark: "oklch(88.21% 0 0)"
  neutral-canvas-light: "oklch(98.5% 0 0)"
  neutral-surface-light: "oklch(96.44% 0 0)"
  neutral-text-light: "oklch(16.15% 0 0)"
  chrome-amber: "oklch(72% 0.17 70)"
  chrome-sky: "oklch(70% 0.14 235)"
  destructive: "oklch(70.4% 0.191 22.216)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  eyebrow:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.22em"
rounded:
  full: "9999px"
  toolbar: "calc(26 / 12 * 1rem)"
  compact: "calc(20 / 12 * 1rem)"
  titlebar: "calc(16 / 12 * 1rem)"
  menu: "calc(12 / 12 * 1rem)"
  card: "calc(10 / 12 * 1rem)"
  control: "0.625rem"
  sm: "0.375rem"
spacing:
  control-sm: "0.375rem"
  control-md: "0.625rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  dock-action:
    size: "2.75rem"
    rounded: "{rounded.card}"
    backgroundColor: "{colors.neutral-raised-dark}"
    textColor: "{colors.neutral-text-dark}"
    padding: "0"
  dock-action-hover:
    rounded: "{rounded.card}"
    backgroundColor: "oklch(24.39% 0 0)"
    textColor: "{colors.neutral-text-dark}"
    padding: "0"
  segmented-item-active:
    rounded: "{rounded.full}"
    backgroundColor: "{colors.neutral-surface-dark}"
    textColor: "{colors.neutral-text-dark}"
    padding: "0.375rem 0.625rem"
  segmented-item:
    rounded: "{rounded.full}"
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-muted-dark}"
    padding: "0.375rem 0.625rem"
  input:
    rounded: "{rounded.control}"
    backgroundColor: "oklch(96.44% 0 0 / 0.06)"
    textColor: "{colors.neutral-text-dark}"
    padding: "0.5rem 0.75rem"
---

> **On-demand reference.** Load this file explicitly when working on design system decisions, visual aesthetics, or component style conventions. It is not auto-loaded on every agent turn.

# Design System: Neutral System Builder

## 1. Overview

**Creative North Star: "The Calibration Chamber"**

Neutral System Builder is a precision instrument, not a creative sandbox or portfolio piece. Personality: **rigorous, composed, operable** — the kind of surface you would trust inside Stripe, Figma, Linear, or Vercel. Its UI is deliberately colorless: achromatic neutrals from near-black to near-white, a single warm accent that appears only where it carries meaning, and motion that communicates system response rather than aesthetic personality. The chrome recedes so the ramp colors — the actual output of the tool — read true. Every pixel that isn't the user's color system is a pixel that should not exist.

**Reference posture (tone, not mimicry):** Stripe-like operational density and clarity; Figma-like inspectable token logic in panels and readouts; Linear-like restrained hierarchy and fast focused workflows; Klim specimen–level typographic discipline in labels and numerical copy.

The system rejects without exception: Adobe-style tool heaviness, no-code SaaS gloss, Notion block-stacking, AI-wrapper theatrics (glow, vague magic panels), portfolio motion that competes with logic, and analytics-dashboard clutter that reads as BI instead of authoring.

The design language is taut without being stark. Type is set at information density, not comfort density. Controls recede until needed, then confirm without surprising. The floating dock uses genuine depth (hardcoded shadows, backdrop blur) to separate it from the canvas it floats above, earning its visual weight rather than borrowing it from a color.

**Key Characteristics:**
- Deep achromatic dark-by-default chrome, with a light mode that is equally precise
- Single saturated accent: Calibration Orange, used only as the brand/primary surface
- OKLCH-native throughout, no sRGB shortcuts
- Print-point radius scale: toolbar radii calculated in pt units for geometric precision
- Text-relative elevation: most shadows derive from `color-mix(in oklch, text 8-14%, transparent)`, so they adapt to both themes
- IBM Plex Mono for all numerical readouts, labels, and eyebrow text
- Motion uses exponential ease-out exclusively; no bounce, no spring

## 2. Colors: The Achromatic Canvas

A deliberately colorless system in service of a color tool. The neutrals are engine-generated OKLCH steps that the user configures; the chrome is a fixed read-only layer on top. Calibration Orange is the only saturated color that belongs to the UI itself.

> **Note on OKLCH:** All color values in this system are OKLCH-canonical. Stitch's hex validator will flag these; that is expected and accepted. Converting to hex would lose precision in the Display-P3 gamut that this tool explicitly supports.

### Primary
- **Calibration Orange** (`oklch(69.3% 0.2546 37.91)`): The sole saturated accent. Appears as `--color-surface-brand`, `--primary`, and the `::selection` highlight. Its rarity makes it informative: when you see Calibration Orange, something is active, selected, or branded. Forbidden as decoration.

### Secondary
- **Chrome Amber** (`oklch(72% 0.17 70)` dark / `oklch(90% 0.12 92)` light): Warm indicator chrome used exclusively for light-mode state signaling. Derived into a full grid of alpha mixes (border, surface, hover, fill). Not a design color; a functional chrome.
- **Chrome Sky** (`oklch(70% 0.14 235)` dark / `oklch(88% 0.08 230)` light): Cool indicator chrome used exclusively for dark-mode state signaling. Same grid structure as Amber.

### Neutral
The neutral ramp is engine-generated at runtime. The following values are the first-paint fallbacks (dark mode defaults) and light mode overrides, representing the canonical ends of the scale.

- **Void** (`oklch(16.15% 0 0)`): The deepest surface (`surface-sunken`). App background in dark mode. Light: `oklch(98.5% 0 0)`.
- **Obsidian** (`oklch(18.21% 0 0)`): Main page canvas (`surface-default`). Light: `oklch(96.44% 0 0)`.
- **Graphite** (`oklch(22.33% 0 0)`): Raised surface for cards and dock actions (`surface-raised`). Light: `oklch(92.32% 0 0)`.
- **Ash** (`oklch(96.44% 0 0)`): Primary text in dark mode. Light: `oklch(16.15% 0 0)`.
- **Smoke** (`oklch(88.21% 0 0)`): Muted text and secondary labels. Light: `oklch(24.39% 0 0)`.

### Named Rules
**The Achromatic Canvas Rule.** The workbench chrome is colorless by design. The user's ramp colors are the product; the UI is the container. Any saturated color added to the chrome competes with the output and must be rejected.

**The One Voice Rule.** Calibration Orange appears in exactly one semantic role: the active/brand surface. Never use it for hover states, decorative borders, background tints, or gradients. Its informational value depends entirely on its rarity.

## 3. Typography

**Display Font:** Geist (with ui-sans-serif, system-ui fallbacks)
**Body Font:** Inter (with ui-sans-serif, system-ui fallbacks)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, SFMono-Regular, Menlo fallbacks)

**Character:** Geist's geometric precision headings over Inter's readable neutrality in body. IBM Plex Mono grounds all numerical data and labels, reinforcing that readouts are measurements, not prose.

### Hierarchy
- **Display** (Geist, weight 500, lh 1.1, ls -0.02em): Reserved for the largest identity moments, if any. Not used in the workbench UI itself.
- **Headline** (Geist, weight 400, lh 1.2, ls -0.01em): Section titles, panel headers. Used sparingly.
- **Body** (Inter, 0.875rem, weight 400, lh 1.5): Main paragraph text and form labels. Max line length 65-75ch where it appears in longer blocks.
- **Label** (Inter, 0.6875rem, weight 400, lh 1, ls 0.01em): Section labels, UI chrome text, control annotations. Used everywhere.
- **Mono** (IBM Plex Mono, 0.6875rem, weight 400-500, lh 1): All numerical readouts, OKLCH values, hex codes, token names, and step indices. `font-variant-numeric: tabular-nums` for aligned columns.
- **Eyebrow** (IBM Plex Mono, 0.65rem, weight 400, ls 0.22em, uppercase): Section dividers and category labels. Sparse use only.

### Named Rules
**The Mono Anchor Rule.** Every number that means something uses IBM Plex Mono. Color values, step indices, percentage readouts, export token names: all mono. This makes numerical content scannable at density and reinforces the calibration metaphor.

**The No-Decoration Rule.** No gradient text, no outlined text, no colored display type. Weight and size carry hierarchy. Color carries meaning only through the accent and semantic role system.

## 4. Elevation

The system uses tonal layering for inter-surface depth, with text-relative adaptive shadows for structural lift. Shadows are not decorative; they appear only as a response to hierarchy or state. The floating dock and control panels use hardcoded black-channel shadows to guarantee legibility regardless of the user's custom ramp.

### Shadow Vocabulary
- **raised** (`0 1px 2px oklch(text 8%, transparent)`): Minimal lift for dock action buttons and interactive cards. State-responsive: the lift is the affordance.
- **lg** (`0 4px 16px -4px oklch(text 10%, transparent), 0 2px 6px -2px oklch(text 6%, transparent)`): Inspector panels and elevated content areas.
- **overlay** (`0 8px 30px oklch(text 12%, transparent)`): Popovers, menus, detached panels.
- **xl** (`0 12px 40px -8px oklch(text 14%, transparent), 0 4px 14px -4px oklch(text 8%, transparent)`): Modal surfaces and heavy overlays.
- **dock-panel** (`0 18px 48px -20px rgb(0 0 0 / 0.55), 0 4px 12px -6px rgb(0 0 0 / 0.35)`): The floating control center dock. Hardcoded black channel: must read against any user-configured ramp.
- **dock-picker-surface** (`0 16px 36px -12px rgb(0 0 0 / 0.2), 0 6px 14px -8px rgb(0 0 0 / 0.12)`): The picker popup when detached from the dock.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only in response to elevation state (hover, popup, focus, floating). A shadow that exists at rest is structural, not decorative: every resting shadow must earn it by communicating a genuine layer hierarchy.

**The Text-Relative Shadow Rule.** Standard shadow tokens derive from `color-mix(in oklch, text N%, transparent)` so they adapt to both light and dark themes without being redefined. Only the dock and picker-surface use hardcoded black-channel shadows, where the content beneath may be any user-configured color.

## 5. Components

Controls recede until needed, then confirm without surprising. State transitions use 150ms ease-out; structural animations use 200-220ms with expo/quart curves.

### Dock Action Button
The atomic icon button in the floating control center dock. 44px square, gently curved (0.833rem radius).

- **Shape:** Gently curved (calc(10/12 * 1rem), ~13.3px)
- **Default:** `surface-raised` background, default text color, `shadow-raised` lift
- **Hover:** Steps to `surface-overlay`, no transform
- **Active:** Steps one more tier toward overlay
- **Focus:** Calibration Orange focus ring (dark mode) or deep neutral ring (light mode), 3px offset
- **Icon size:** 1.125rem (18px), `currentColor` stroke

### Segmented Control
The primary mode-switching pattern throughout the workbench. Pill outer container, pill items.

- **Shape:** Full-radius (9999px) container; full-radius items inside
- **Container:** Hairline border, 6% text-alpha background, 2px padding
- **Inactive item:** Muted text color, transparent background, 150ms color transition
- **Active item:** `surface-default` background, default text weight 500, subtle shadow + focus-ring tint
- **Focus:** 2px ring, Calibration Orange (dark) or neutral (light)

### Input Field
Used for numeric control fields and text inputs throughout.

- **Shape:** 10px radius
- **Background:** 6% text-alpha (`chrome-field`)
- **Border:** Hairline-strong (18% text-alpha)
- **Focus:** 2px shadow ring (15% text-alpha overlay), no border color change
- **Placeholder:** `text-disabled` color
- **Size:** 0.875rem body text, 0.75rem padding block

### Panel Surface (Control Center)
The detachable floating panel. Compact-toolbar radius (~26.7px), hairline border, 4px backdrop blur.

- **Shape:** calc(20/12 * 1rem) radius — the most visually distinctive radius in the system
- **Border:** 1px hairline (10% text-alpha)
- **Background:** `surface-default` for the body; `surface-raised` for the preview tier above
- **Backdrop:** `blur(4px)` for the panel shell; `blur(24px) saturate(125%)` for the dock background
- **Stack:** Preview tier (z:1) sits above controls tier (z:0); structural separation, not decoration

### Ramp Swatch Rail (Signature Component)
The central visualization: a full-width flex strip of color cells representing each step of the user's neutral ramp. This component IS the product output, visible in the workbench surface.

- **Layout:** Full-width flex, `min-width: 1rem` per cell (no fixed column count)
- **Cell height:** 2.75rem in the dock; taller in the preview area
- **States:** Live cells are interactive (cursor pointer, focus ring); placeholder cells show `surface-raised` gray
- **Focus:** Inset 2px white ring + outer `ring` color outline for keyboard navigation
- **Keyboard selection:** `data-kbd="true"` adds `inset 0 0 0 2px rgb(255 255 255 / 0.75)`
- **Theme indicator:** Amber tint for light-mode rail, Sky tint for dark-mode rail

### Eyebrow Label
Monospaced uppercase section dividers. Appears before grouped control blocks.

- **Font:** IBM Plex Mono, 0.65rem, tracking 0.22em, uppercase
- **Color:** `text-muted`
- **Margin:** 0.5rem block-end before its content group

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH for all color values. The system is OKLCH-native; sRGB hex values lose precision for Display-P3 gamut.
- **Do** use `color-mix(in oklch, var(--color-text-default) N%, transparent)` for alpha surfaces and shadows in standard components. This keeps surfaces adaptive across themes.
- **Do** use `--radius-compact-toolbar` (calc(20/12 * 1rem)) for the outer radius of any floating panel or popup.
- **Do** use IBM Plex Mono for any numerical readout, OKLCH value, token name, or measurement. Numbers are measurements; measurements use mono.
- **Do** use `ease-out-quart` (`cubic-bezier(0.17, 0.84, 0.44, 1)`) or `ease-out-expo` for all state transitions.
- **Do** allow information density. Expert users read dense layouts; don't pad out to create whitespace at the expense of visible data.
- **Do** use the `--chrome-hairline` (10% text-alpha) and `--chrome-hairline-strong` (18% text-alpha) tokens for all borders. Never hardcode a border color.
- **Do** use hardcoded black-channel shadows (`rgb(0 0 0 / N)`) for the dock and floating panels only, where the background may be a user-configured ramp color.

### Don't:
- **Don't** add saturated colors to the UI chrome. The workbench is colorless by design. Calibration Orange is the only accent; it is not available for hover states, border decorations, or background fills.
- **Don't** apply Adobe-style tool heaviness: no persistent dark icon bars, no multiple competing floating panels, no nested bordered regions within bordered regions.
- **Don't** apply no-code SaaS friendliness: no gradient cards, no pastel tints, no rounded-everything pill aesthetics applied uniformly. Roundness is earned by component role (toolbar, pill toggle) not applied by default.
- **Don't** stack blocks like Notion: each section should have a clear spatial hierarchy. Avoid uniform vertical rhythm that makes every block feel the same weight.
- **Don't** use AI-wrapper visuals: glowing gradients, “magic” panels, or chatbot-first framing. Intelligence shows up as inspectable tokens and contrast math, not decorative futurism.
- **Don't** perform taste through motion or branding effects. Portfolio theatrics compete with the ramp; the system logic is the proof.
- **Don't** borrow analytics-dashboard patterns (metric cards, chart chrome, BI density). This is design-system authoring, not reporting.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with background tints or full borders.
- **Don't** use gradient text (`background-clip: text`). Emphasis via weight or size only.
- **Don't** animate layout properties (`width`, `height`, `padding`, `margin`). Animate `transform`, `opacity`, `color`, `background-color`, `box-shadow`.
- **Don't** use bounce or elastic easing. Precision instruments respond with exponential ease-out; they don't spring.
- **Don't** hardcode light or dark color values in components without theme-aware logic. Use the semantic token layer (`--color-*`) or `color-mix(in oklch, var(--color-text-default) N%, transparent)`.
- **Don't** override the ramp swatch rail's `width` at the container level. The flex strip collapses if given a fixed width; use `w-full` only.
