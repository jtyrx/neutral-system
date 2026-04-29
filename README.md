# Neutral System Builder

A workbench for designing, testing, and exporting the **neutral foundation** of a modern design system — not a palette tool. You start at an OKLCH ramp, end at production-ready semantic tokens, and pressure-test the whole thing in realistic UI along the way.

Live at [neutral-system.vercel.app](https://neutral-system.vercel.app).

---

## Why I built this

Most color tools stop at the ramp. You pick a hue, they generate ten tints and shades, you export a palette. That's the easy part. The hard part is everything after — deciding which step becomes `surface.default`, what "raised" means in dark mode, why focus rings need their own contrast logic, how brand color interacts with a neutral system without fighting it.

In real product work, neutrals carry most of the UI. They define elevation, hierarchy, readability, and trust. When a design system ages badly, it's almost always because the neutrals were chosen visually but never modeled structurally. Dark mode breaks. Elevation flattens. Contrast drifts. Brand color sits awkwardly on top of a surface ladder it was never designed to pair with.

This project is the tool I wanted while building design systems: a place to make those structural decisions **visibly** — where the primitives, the semantic mapping, and the rendered UI are all looking at the same source of truth, at the same time.

---

## What it is

Neutral System Builder is a single-page workbench that generates a full neutral design system from a small set of inputs. It isn't trying to be a brand-palette generator or a swatch explorer. It's closer to a **CAD tool for design tokens**: you tune the underlying model, and the downstream surfaces, text roles, borders, and themes all recompute in place.

The product models four layers:

1. **A primitive OKLCH ramp** — the numeric source of truth (`--color-neutral-*` tier‑1 variables).
2. **A semantic token layer** — `surface.default`, `text.muted`, `border.focus`, and so on.
3. **Theme resolution** — the same roles resolve independently for light and dark elevated.
4. **A live preview workbench** — actual UI compositions rendering against the tokens as you build.

Every control change flows through the same engine in a single commit, so what you see on screen is always what an engineer would ship.

---

## The problem space

A few honest observations that shaped this:

- **Palette generators don't model intent.** `neutral-500` is a value. `surface.default` is a decision. Systems that only expose primitives push that decision onto every downstream consumer.
- **Dark mode isn't a color problem.** It's an elevation problem. When higher surfaces read *lighter* on a dark canvas, the ladder has to be planned, not mirrored. Most tools don't acknowledge this at all.
- **Contrast is a role question, not a global setting.** Text on brand isn't the same pairing as text on sunken. A system needs to validate the pairings that actually exist, not the theoretical cross product.
- **Brand color lives outside the neutral logic.** Most tools treat it as an afterthought. It needs a dedicated surface plane that coexists with the elevation ladder without being a sixth rung on it.
- **Focus rings shouldn't come from the border ramp.** They need max contrast against the active surface, which means they're derived — not picked.
- **Tokens need to be shippable.** A preview without an export is a mockup. An export without a preview is a guess.

Neutral System Builder tries to take every one of those seriously.

---

## What it does

You can do most of the work in four areas of the workbench.

### 1 · Global scale

Build the underlying OKLCH ramp: 8–48 steps, linear lightness between a lightest and darkest `L`, with hue and chroma shaping on top. Four chroma modes — achromatic, fixed, tapered-mid, tapered-ends — produce meaningfully different neutrals from the same lightness curve. Presets cover the common directions (pure, warm, cool, bluish), or you dial in your own. Index 0 is lightest, last is darkest — the ramp is deterministic, cached, and pure.

### 2 · Contrast & role mapping

Pick where on the ramp the **semantic surfaces, borders, and text** land, independently for light and dark elevated themes. Each role group has its own `start`, `count`, and `step interval` — so "how many surface elevations," "how spaced apart the border tones are," and "where the text hierarchy begins" are all separate, intentional decisions. A `contrastDistance` multiplier (`subtle` / `default` / `strong` / `inverse`) scales the whole mapping at once for tuning global contrast personality without redoing the picks.

### 3 · Preview

Both themes render side-by-side in realistic UI blocks — surfaces at each elevation, text at each tone, borders in context, interactive states, WCAG 2.2 contrast pairs for the pairings that matter. The preview is the inspector. Click a swatch or a token, the right rail shows its OKLCH, hex, source index, and contrast ratios. This is where you discover that `text.muted` fails on `surface.sunken`, or that `border.subtle` disappears in dark elevated, and adjust before shipping.

### 4 · Export

Once the system looks right, export it as:

- **Tailwind v4 `@theme inline`** — primitives as `--color-neutral-*`, semantics as `--color-surface-default`, `--color-text-on`, `--color-border-focus`, chrome mixers as `--chrome-*`, runtime-swappable via `[data-theme="light"]` / `[data-theme="dark"]`.
- **CSS custom properties** — same variables without the `@theme` wrapper.
- **JSON** — for design tools, documentation, or programmatic consumers.
- **CSV** — for spreadsheets, audits, and anyone who needs to diff a system across versions.

Presets save the full config (`globalConfig` + `systemConfig`) so any system you build is reloadable and shareable as a small JSON blob.

---

## Core concepts

A few ideas that the whole product rests on:

### Primitive vs semantic

Primitives are **values** — a specific OKLCH color at a specific ramp index. Semantics are **decisions** — "this is the page background; this is body text." The export keeps both: tier-1 `--color-neutral-*` for direct ramp access, tier-2 `--color-surface-default` / `--color-text-default` for the tokens consumers should actually read from. The contract between designers and engineers lives at tier-2.

### Light vs dark-elevated

Both themes are derived from the same ramp but picked differently. Light mode walks ascending indices (higher surface elevation = lighter = lower index). Dark elevated reverses: the darkest step is the canvas, and higher surfaces walk *lighter* up the ladder. The mapping UI exposes independent `*Start` / `*Count` / `*StepInterval` fields for each theme, so dark mode gets to be its own plan rather than a flipped version of light.

### Contrast emphasis

Rather than tuning thirty controls when you want a moodier system, contrast emphasis is a single multiplier applied to the mapping before token derivation. `subtle` compresses spacing; `strong` widens it; `inverse` flips the polarity. The same global ramp can produce four meaningfully different systems this way.

### Surface taxonomy

Five standard elevation rungs (`sunken` → `default` → `subtle` → `raised` → `overlay`), plus two dedicated planes:

- `surface.brand` — a distinct accent surface that coexists with the elevation ladder instead of interrupting it.
- `surface.inverse` — a high-contrast flip, used with `text.on` for inverse-paired UI (toasts, dark sections inside light apps, and vice versa).

### Border roles

Three ladder picks (`default` / `subtle` / `strong`) plus a derived `border.focus` — a max-contrast neutral computed as a ramp flip of `surface.default`, kept structurally separate from control boundaries. Focus rings shouldn't borrow from the same pool as card borders; they don't do the same job.

### Brand integration

`surface.brand` accepts a custom OKLCH via the brand color picker. When parsed successfully, it exports directly — not as `var(--color-neutral-*)` — so the on-brand plane stays its own color, not a rung pulled from the neutral ramp. When invalid or empty, it falls back to a ramp-derived accent so the system never breaks mid-flow.

### Naming

Internal roles are dot-paths (`surface.default`, `text.on`, `border.focus`). The CSS export rewrites them to hyphenated variables at the boundary (`--color-surface-default`). Dot paths stay in the engine and UI so reasoning about roles reads like reasoning about structure, not strings.

---

## The preview workbench

The preview isn't marketing chrome. It exists because a design system looks fine at the token level and wrong in actual UI, or vice versa, more often than is comfortable.

It renders paired light and dark compositions using the live token output — page surfaces, cards, muted text on subtle surfaces, strong text on brand, focus rings in interactive states, the pairings from `contrastContracts.ts`. Click anywhere and the inspector shows the full color data and its WCAG 2.2 ratio.

This is where the real work happens. You'll see:

- which surface elevations actually read distinct under your chosen chroma mode
- whether `text.muted` survives on `surface.sunken` in dark mode
- how the brand surface sits against the elevation ladder under different hues
- whether your focus ring is legible on every surface it might appear on
- how a `contrastEmphasis` change cascades through every pairing at once

It's closer to instrumentation than to a gallery.

---

## Architecture

The code is split into two intentionally separate layers.

### Engine — `lib/neutral-engine/`

Pure, framework-free, no React. Composes as a deterministic pipeline:

1. `buildGlobalScale(config)` — constructs the OKLCH ramp (`GlobalSwatch[]`), cached.
2. `applyContrastEmphasisToSystemMapping(mapping, emphasis)` — scales spacing before picks.
3. `deriveSystemTokens(global, mapping)` — resolves ladder indices into semantic tokens for one theme.
4. `buildTokenView(tokens)` — view-model for the UI (sorted, grouped, indexed).
5. `exportCssVariables / exportJson / exportCsv / exportTailwind` — terminal serializers.

The engine's React-visible output is `SerializedColor` only (OKLCH string, hex, sRGB, gamut flag). Live `colorjs.io` `Color` instances stay inside the engine — reparsed on demand when downstream math genuinely needs them. That boundary keeps React's reconciliation and DevTools snapshotting proportional to data, not to color-library prototype graphs.

### Workbench — `hooks/useNeutralWorkbench.ts` + `components/`

Single hook orchestrates all state. Every control routes through it. Input changes are **synchronous**: one engine pass, one token derivation, one CSS write per commit. CSS variables are injected via `useLayoutEffect` into a live `<style>` tag so theme changes land before paint.

UI is organized into sections (`components/sections/*`), preview panels (`components/preview/*`), and visualizations (`components/viz/*`), all consuming the same hook output.

### Tokens-first CSS

Theme tokens live in `@theme` blocks inside `app/globals.css`. No `tailwind.config.*` file — Tailwind v4's CSS-first theme model drives everything, which is also exactly what the export produces. The builder eats its own dog food.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme`, PostCSS via `@tailwindcss/postcss`)
- **`colorjs.io`** for all color math (OKLCH, ΔE, WCAG 2.2)
- **pnpm** as the canonical package manager
- Deployed on **Vercel**

No test runner is configured yet; type-check + lint + build are the current CI gates.

---

## Local development

```bash
pnpm install
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000).

```bash
pnpm type-check   # strict tsc --noEmit
pnpm lint         # eslint (next/core-web-vitals + next/typescript)
pnpm build        # production build
pnpm start        # serve the built output
```

### Repo orientation

- `app/` — Next.js App Router entry, global CSS, root layout.
- `lib/neutral-engine/` — the engine (pure, no React).
- `hooks/useNeutralWorkbench.ts` — state orchestrator.
- `components/workbench/` — shell, controls, inspector, live theme writer.
- `components/sections/` — the four workbench sections.
- `components/preview/` — rendered UI compositions.
- `components/viz/` — ramps, offset diagrams, sparklines.

`CLAUDE.md` and `AGENTS.md` contain the canonical architectural invariants and conventions — those are the docs to read before making structural changes.

---

## Current focus

- Tightening the preview library: more realistic UI blocks, better inverse-pair coverage, a proper "system audit" panel that flags every failing role pair at once.
- Sharpening brand-color integration so the on-brand plane produces a predictable hover / pressed / border triplet without the user having to wire those separately.
- Incremental accessibility work — extending WCAG contracts beyond surface × text into border × background and focus × surface pairs.

## What's next

- **Shareable system URLs** — preset JSON is in today, but hosted share links would make design-review hand-off trivial.
- **Per-theme export profiles** — outputting `@theme` variants instead of a single runtime-switched stylesheet.
- **Diffing across versions** — compare two saved systems token-by-token, flag what changed and why it matters.
- **Integration recipes** — drop-in snippets for shadcn, Radix Themes, and a few opinionated product stacks, so the exported tokens have a clear first mile after download.

---

## About

Built by [Jayson](https://jaysonacorda.com) as a working case study in neutral-system design — the kind of tool I wanted while building design systems in-house and couldn't find. It's opinionated on purpose, and it's still being pushed forward.

If any of this resonates, or you're wrestling with neutrals in your own system, I'd like to hear about it.
