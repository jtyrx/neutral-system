# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. For **Cursor Agent / Composer**, use [`AGENTS.md`](AGENTS.md).

## Commands

This repo uses **pnpm** (`pnpm-lock.yaml` is the source of truth; the `packageManager` field in `package.json` pins the version).

```bash
pnpm install        # install dependencies
pnpm dev            # Next.js dev server (Turbopack) on :3000
pnpm build          # production build
pnpm start          # serve built output
pnpm lint           # ESLint (next/core-web-vitals + next/typescript)
pnpm type-check     # tsc --noEmit (strict)
pnpm test           # vitest run (engine unit tests)
pnpm test:watch     # vitest watch mode
```

Vitest covers `lib/**/*.test.ts` (any engine or lib subdirectory).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`) · `colorjs.io` for all color math · `@base-ui/react` for UI primitives · `sonner` for toasts. Path alias `@/*` resolves from repo root.

## UI Components

Use **shadcn with Base UI** (not Radix UI) for all new interactive primitives.

- Install via: `pnpm dlx shadcn@latest add --base-color neutral <component-name>`
- The `--base-color neutral` flag keeps generated tokens consistent with this project's neutral system palette.
- Prefer shadcn Base UI variants over hand-rolling Radix primitives directly — the generated files land in `components/ui/` and are owned by this repo (edit freely).
- Do **not** mix Radix UI and Base UI primitives in the same component; pick one primitive layer per component family.
- For components not yet in shadcn's catalog, compose from existing `components/ui/` primitives before reaching for a raw Radix or third-party package.

## Architecture

The app is a single-page workbench (`app/page.tsx` → [Workbench](components/workbench/Workbench.tsx)) that generates a neutral color system. Two layers:

**Engine — [lib/neutral-engine/](lib/neutral-engine/)** is pure, framework-free, and re-exported through [index.ts](lib/neutral-engine/index.ts). Data flows:

1. [globalScale.ts](lib/neutral-engine/globalScale.ts) — `buildGlobalScale(GlobalScaleConfig)` produces the ordered OKLCH ramp (`GlobalSwatch[]`). **Index 0 is lightest, last index is darkest.** Ladder length is pinned to `[GLOBAL_SCALE_STEP_MIN, GLOBAL_SCALE_STEP_MAX] = [8, 48]` by `clampGlobalScaleSteps`.
2. [systemMap.ts](lib/neutral-engine/systemMap.ts) — `deriveSystemTokens(global, SystemMappingConfig)` resolves ladder indices into semantic tokens for a single `themeMode`. Light and dark elevated use separate `*Start` / `*Count` / `*StepInterval` fields. Picks are always `clampSystemMappingToLadderLength`-ed first so nothing escapes `[0, n−1]` (except `darkFillStart`, which may be `−1`). `resolveBorderFocusIndex` emits `border.focus` as a ramp flip of `surface.default` (not a stroke-count rung).
3. [effectiveMapping.ts](lib/neutral-engine/effectiveMapping.ts) — `applyContrastEmphasisToSystemMapping` multiplies `contrastDistance` (`subtle`/`default`/`strong`/`inverse`). This must run **before** token derivation so preview, UI, and exports all see the same resolved spacing.
4. [semanticNaming.ts](lib/neutral-engine/semanticNaming.ts) — dot-path roles for a **governed neutral system**: surface elevation (`surface.sunken` → `surface.overlay`, then `surface.brand` and `surface.inverse`), readable text (`text.default` → `text.disabled` + `text.on`), border structure (`border.default` / `subtle` / `strong` + `border.focus`), plus `state.hover`, `overlay.scrim`, `emphasis.*`. `isInversePairRole` / `isBorderFocusRole` separate flip tokens from ladder counts.
5. [exportFormats.ts](lib/neutral-engine/exportFormats.ts) — JSON / CSS variables / CSV / Tailwind v4 `@theme inline`. Tier-1 primitives export as **`--color-neutral-<label>`** (literal OKLCH); tier-2 semantics as `--color-surface-default`, `--color-border-focus`, etc. (`semanticColorVarName` handles the dot → hyphen rewrite). [chromeAliases.ts](lib/neutral-engine/chromeAliases.ts) defines **`CHROME_MIXER_LINES`** (`--chrome-*` mixers) injected after tier-2 in each `[data-theme]` block; legacy **`--ns-*`** aliases live in `app/globals.css` only. Designed for **CSS-first** `@theme` consumption in Tailwind v4.
6. [okhsl.ts](lib/neutral-engine/okhsl.ts) — `okhslViewFromConfig(cfg)` projects the canonical OKLCH config into an OKHSL authoring view; `applyOkhslEdit(cfg, edit)` commits slider edits back to OKLCH fields. Pure functions — no React, no state. OKHSL is a **view**, not parallel state.

**Workbench — [hooks/useNeutralWorkbench.ts](hooks/useNeutralWorkbench.ts)** is the single state orchestrator. Every control reads/writes through this hook. Important invariants encoded here:

- **All input changes are synchronous** — one token derivation + CSS write per commit. `useTransition` / `useDeferredValue` were intentionally removed from this hook (see the file-header comment): concurrent scheduling lost to Chromium's 1Hz `rAF` / `useEffect` throttle on unfocused windows, turning one-frame updates into minute-long stalls. Keep this hook synchronous unless that trade-off is revisited.
- `inputBusy` is retained on the return surface for API compatibility but is **always `false`**. Do not wire new loading UI to it.
- CSS variable writes live in [components/providers/LiveThemeStyles.tsx](components/providers/LiveThemeStyles.tsx) and use **`useLayoutEffect`** (not `useEffect`) so the paint isn't deferred into the 1Hz throttle window.
- Both `lightTokens` and `darkTokens` are always derived (export and theme panels need both), even in `focus` comparison mode.
- `effectiveMappingConfig` is the canonical config for any UI that previews resolved indices — it must match what `deriveSystemTokens` sees.
- `okhslEnabled` / `okhslView` / `setGlobalConfigFromOkhsl` expose the OKHSL overlay on the hook surface. `okhslView` is memoized from `okhslViewFromConfig(globalConfig)`; edits flow through `setGlobalConfig` — no second state atom.

**UI layout.** [Workbench.tsx](components/workbench/Workbench.tsx) renders preview + inspector columns; [WorkbenchControlsShell.tsx](components/workbench/WorkbenchControlsShell.tsx) + [BuilderControlsSections.tsx](components/workbench/BuilderControlsSections.tsx) group controls into **Scale → Contrast & role mapping → Inspect → Export**. `components/sections/*` are the section bodies; `components/preview/*` renders palette/token tables; `components/viz/*` renders OKLCH ladders and offset diagrams.

**Preset loading** uses a custom window event: dispatch `neutral-system:load-preset` with `{ globalConfig, systemConfig }` in `detail` — the Workbench subscribes and runs `migrateSystemMappingConfig` + `clampGlobalScaleSteps` before applying.

## Conventions

- **Single source of truth for derived state**: never recompute ladder picks ad hoc in a component — import from [systemMap.ts](lib/neutral-engine/systemMap.ts) (`pickLightIndices`, `pickDarkIndices`, `pickDarkStrokeTextIndices`, `previewResolvedRoleIndices`, `mirrorRampIndex`).
- **Clamping is mandatory** when `steps` changes: call `clampSystemMappingToLadderLength` before consuming a `SystemMappingConfig`, otherwise starts / dark segment can be out of range.
- **Role ids are dot-paths** (`surface.raised`, `text.muted`) and are used unchanged as `SystemToken.id`/`name`/`role`. CSS-safe form is produced by `tokenCssVarName` / `semanticColorVarName` at export time only — don't pre-flatten them.
- **Color on the React surface is `SerializedColor` only.** `GlobalSwatch` and `SystemToken` carry `serialized: SerializedColor` (strings + gamut flag); they do **not** carry a live `colorjs.io` `Color` instance. Never add `Color` to a type consumed by components, hooks, or React state — the prototype-heavy graph blows up React DevTools / console snapshot cost in dev.
- **When Color math is unavoidable** (WCAG contrast, ΔE, OKLCH coord reads), reparse at the call site with `parseColorFromSerialized(s.serialized)` or `oklchCoordsFromSerialized(s.serialized)` from [lib/neutral-engine/serialize.ts](lib/neutral-engine/serialize.ts). Create `Color` instances only inside the engine or at the leaf of a memoized selector, and let them be garbage-collected immediately.
- **Color creation inside the engine** always via `new Color(...)` + `serializeColor`; don't hand-format hex or sRGB. Rely on `SerializedColor.inSrgbGamut` for out-of-gamut flags rather than re-checking.
- **OKLCH strings** use `oklch(L% C H)` with `none` for hue when achromatic (`buildOklchString`). Match that form in any new CSS output.
- **Code style**: single quotes, no semicolons, trailing commas, 2-space indent, `type` imports. Files default to `'use client'` because the whole workbench is interactive; server-side files (`app/layout.tsx`, engine modules) deliberately omit it.
- **Tailwind v4 only** — no `tailwind.config.*`. Theme tokens live in `@theme` blocks inside [app/globals.css](app/globals.css). PostCSS plugin is `@tailwindcss/postcss`.
- **Debug instrumentation** lives in [lib/debug/presetDebug.ts](lib/debug/presetDebug.ts). `presetDebugEnabled()` is **hard-gated to `process.env.NODE_ENV === 'development'`** — stale opt-ins (URL param, localStorage, window flag) cannot leak cost into prod builds. Keep new debug log sites funneled through `presetDebugEnabled()` so this gate remains the single kill-switch.
- **`cn()` for class merging**: all `components/ui/` components use `cn(...inputs)` from [lib/utils.ts](lib/utils.ts) (`clsx` + `tailwind-merge`). Use it whenever conditionally merging Tailwind classes — never string-concatenate class names.
- **Prettier**: installed as a devDep with `prettier-plugin-tailwindcss` for Tailwind class ordering. No `.prettierrc` — runs with defaults. The plugin auto-sorts `className` props on save if your editor is configured to run prettier on save.

## Token taxonomy (portfolio / governance)

- **Naming:** internal roles are dot paths (`surface.default`). Exports use `semanticColorVarName` → hyphenated segments after `color-` (e.g. `surface.default` → `--color-surface-default`; `text.on` → `--color-text-on`). Tier-1 primitives are **`--color-neutral-<rampLabel>`**. See [exportFormats.ts](lib/neutral-engine/exportFormats.ts) for exact keys.
- **Global ramp:** numeric labels often include **tweener steps** (e.g. `925`, `975`) so the dark tail has enough distinct lightness stops for **elevation without banding** — extra rungs are intentional, not decorative.
- **Surfaces:** five standard rungs model **luminance elevation** (deepest well → overlay); in dark elevated, higher elevation reads **lighter** along the mapped picks. `surface.brand` is a **distinct accent plane** (one step past overlay on the ramp). `surface.inverse` stays a **dedicated high-contrast flip**, not a sixth ladder rung.
- **Text:** four standard tones plus **`text.on`** for copy on inverse / bold surfaces — paired with surfaces for **WCAG 2.2**-oriented checks via [contrastContracts.ts](lib/neutral-engine/contrastContracts.ts).
- **Borders:** three ladder picks plus **`border.focus`**, a **max-contrast neutral** for focus rings, kept separate from `border.strong` (control boundaries).
- **Theming:** the same role names resolve per `themeMode`; CSS variables are duplicated under `[data-theme="light"]` / `[data-theme="dark"]` so the system is **runtime-swappable** and **theme-aware**.

## Deployment

Production target is Vercel (`vercel.json` pins `framework: nextjs`; Vercel auto-detects pnpm from `pnpm-lock.yaml` and the `packageManager` field in `package.json`). Turbopack `root` is pinned in [next.config.mjs](next.config.mjs) because parent directories on the dev machine may contain unrelated lockfiles.
