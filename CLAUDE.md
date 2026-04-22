# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. For **Cursor Agent / Composer**, use [`AGENTS.md`](AGENTS.md).

## Commands

```bash
npm run dev         # Next.js dev server (Turbopack) on :3000
npm run build       # production build
npm run start       # serve built output
npm run lint        # ESLint (next/core-web-vitals + next/typescript)
npm run type-check  # tsc --noEmit (strict)
```

No test runner is configured.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`) · `colorjs.io` for all color math · `sonner` for toasts. Path alias `@/*` resolves from repo root.

## Architecture

The app is a single-page workbench (`app/page.tsx` → [Workbench](components/workbench/Workbench.tsx)) that generates a neutral color system. Two layers:

**Engine — [lib/neutral-engine/](lib/neutral-engine/)** is pure, framework-free, and re-exported through [index.ts](lib/neutral-engine/index.ts). Data flows:

1. [globalScale.ts](lib/neutral-engine/globalScale.ts) — `buildGlobalScale(GlobalScaleConfig)` produces the ordered OKLCH ramp (`GlobalSwatch[]`). **Index 0 is lightest, last index is darkest.** Ladder length is pinned to `[GLOBAL_SCALE_STEP_MIN, GLOBAL_SCALE_STEP_MAX] = [8, 48]` by `clampGlobalScaleSteps`.
2. [systemMap.ts](lib/neutral-engine/systemMap.ts) — `deriveSystemTokens(global, SystemMappingConfig)` resolves ladder indices into semantic tokens for a single `themeMode`. Light and dark elevated use separate `*Start` / `*Count` / `*StepInterval` fields. Picks are always `clampSystemMappingToLadderLength`-ed first so nothing escapes `[0, n−1]` (except `darkFillStart`, which may be `−1`). `resolveBorderFocusIndex` emits `border.focus` as a ramp flip of `surface.default` (not a stroke-count rung).
3. [effectiveMapping.ts](lib/neutral-engine/effectiveMapping.ts) — `applyContrastEmphasisToSystemMapping` multiplies `contrastDistance` (`subtle`/`default`/`strong`/`inverse`). This must run **before** token derivation so preview, UI, and exports all see the same resolved spacing.
4. [semanticNaming.ts](lib/neutral-engine/semanticNaming.ts) — dot-path roles for a **governed neutral system**: surface elevation (`surface.sunken` → `surface.overlay`, then `surface.brand` and `surface.inverse`), readable text (`text.default` → `text.disabled` + `text.on`), border structure (`border.default` / `subtle` / `strong` + `border.focus`), plus `state.hover`, `overlay.scrim`, `emphasis.*`. `isInversePairRole` / `isBorderFocusRole` separate flip tokens from ladder counts.
5. [exportFormats.ts](lib/neutral-engine/exportFormats.ts) — JSON / CSS variables / CSV / Tailwind v4 `@theme inline`. Tier-1 primitives export as `--color-neutral-<label>`; tier-2 semantics as `--color-surface-default`, `--color-border-focus`, etc. (`semanticColorVarName` handles the dot → hyphen rewrite). Designed for **CSS-first** `@theme` consumption in Tailwind v4.

**Workbench — [hooks/useNeutralWorkbench.ts](hooks/useNeutralWorkbench.ts)** is the single state orchestrator. Every control reads/writes through this hook. Important invariants encoded here:

- `globalConfig` is used **directly** (not deferred) when computing `global`, so ladder length and resolved indices stay aligned when `steps` changes.
- `systemConfigBase`, `contrastEmphasis`, and `previewTheme` are passed through `useDeferredValue` and wrapped in `startTransition`; the `inputBusy` flag stays true until every deferred mirror catches up so the loading toast spans the full update window.
- Both `lightTokens` and `darkTokens` are always derived (export and theme panels need both), even in `focus` comparison mode.
- `effectiveMappingConfig` is the canonical config for any UI that previews resolved indices — it must match what `deriveSystemTokens` sees.

**UI layout.** [Workbench.tsx](components/workbench/Workbench.tsx) renders preview + inspector columns; [WorkbenchControlsShell.tsx](components/workbench/WorkbenchControlsShell.tsx) + [BuilderControlsSections.tsx](components/workbench/BuilderControlsSections.tsx) group controls into **Scale → Contrast & role mapping → Inspect → Export**. `components/sections/*` are the section bodies; `components/preview/*` renders palette/token tables; `components/viz/*` renders OKLCH ladders and offset diagrams.

**Preset loading** uses a custom window event: dispatch `neutral-system:load-preset` with `{ globalConfig, systemConfig }` in `detail` — the Workbench subscribes and runs `migrateSystemMappingConfig` + `clampGlobalScaleSteps` before applying.

## Conventions

- **Single source of truth for derived state**: never recompute ladder picks ad hoc in a component — import from [systemMap.ts](lib/neutral-engine/systemMap.ts) (`pickLightIndices`, `pickDarkIndices`, `pickDarkStrokeTextIndices`, `previewResolvedRoleIndices`, `mirrorRampIndex`).
- **Clamping is mandatory** when `steps` changes: call `clampSystemMappingToLadderLength` before consuming a `SystemMappingConfig`, otherwise starts / dark segment can be out of range.
- **Role ids are dot-paths** (`surface.raised`, `text.muted`) and are used unchanged as `SystemToken.id`/`name`/`role`. CSS-safe form is produced by `tokenCssVarName` / `semanticColorVarName` at export time only — don't pre-flatten them.
- **Color creation** always via `new Color(...)` from `colorjs.io` + `serializeColor`; don't hand-format hex or sRGB. Rely on `SerializedColor.inSrgbGamut` for out-of-gamut flags rather than re-checking.
- **OKLCH strings** use `oklch(L% C H)` with `none` for hue when achromatic (`buildOklchString`). Match that form in any new CSS output.
- **Code style**: single quotes, no semicolons, trailing commas, 2-space indent, `type` imports. Files default to `'use client'` because the whole workbench is interactive; server-side files (`app/layout.tsx`, engine modules) deliberately omit it.
- **Tailwind v4 only** — no `tailwind.config.*`. Theme tokens live in `@theme` blocks inside [app/globals.css](app/globals.css). PostCSS plugin is `@tailwindcss/postcss`.

## Token taxonomy (portfolio / governance)

- **Naming:** internal roles are dot paths (`surface.default`). Exports use `semanticColorVarName` → hyphenated segments after `color-` (e.g. `surface.default` → `--color-surface-default`; `text.on` → `--color-text-on`). Tier-1 primitives stay `--color-neutral-<rampLabel>`. See [exportFormats.ts](lib/neutral-engine/exportFormats.ts) for exact keys.
- **Global ramp:** numeric labels often include **tweener steps** (e.g. `925`, `975`) so the dark tail has enough distinct lightness stops for **elevation without banding** — extra rungs are intentional, not decorative.
- **Surfaces:** five standard rungs model **luminance elevation** (deepest well → overlay); in dark elevated, higher elevation reads **lighter** along the mapped picks. `surface.brand` is a **distinct accent plane** (one step past overlay on the ramp). `surface.inverse` stays a **dedicated high-contrast flip**, not a sixth ladder rung.
- **Text:** four standard tones plus **`text.on`** for copy on inverse / bold surfaces — paired with surfaces for **WCAG 2.2**-oriented checks via [contrastContracts.ts](lib/neutral-engine/contrastContracts.ts).
- **Borders:** three ladder picks plus **`border.focus`**, a **max-contrast neutral** for focus rings, kept separate from `border.strong` (control boundaries).
- **Theming:** the same role names resolve per `themeMode`; CSS variables are duplicated under `[data-theme="light"]` / `[data-theme="dark"]` so the system is **runtime-swappable** and **theme-aware**.

## Deployment

Production target is Vercel (`vercel.json` pins `framework: nextjs`, `installCommand: npm install`, `buildCommand: npm run build`). Turbopack `root` is pinned in [next.config.mjs](next.config.mjs) because parent directories on the dev machine may contain unrelated lockfiles.
