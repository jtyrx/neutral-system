# AGENTS.md

This file guides **Cursor Agent** and **Composer** when working in this repository. It is self-contained alongside human-oriented docs; for Claude Code, see `CLAUDE.md`.

## Commands

This repo uses **pnpm** (`pnpm-lock.yaml` is the source of truth; the `packageManager` field in `package.json` pins the version).

```bash
pnpm install        # install dependencies
pnpm dev            # Next.js dev server (Turbopack) on :3000
pnpm build          # production build
pnpm start          # serve built output
pnpm lint           # ESLint (next/core-web-vitals + next/typescript)
pnpm type-check     # tsc --noEmit (strict)
```

No test runner is configured.

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`), `colorjs.io` for color math, `sonner` for toasts. Path alias `@/*` resolves from repo root.

## CMS and data

**This app does not use Sanity** (or any other headless CMS). There is no `@sanity/*` dependency, no Studio, and no GROQ. A repo-wide search for `sanity` / `groq` in application code (excluding incidental draft-route plumbing) is empty.

State is entirely **in-browser**: the workbench (`useNeutralWorkbench`) plus optional preset load via the `neutral-system:load-preset` custom event. There is no content API or document store.

`app/api/draft-mode/enable` (if present) is **optional** [Next.js draft mode](https://nextjs.org/docs/app/guides/draft-mode) for generic preview URLs only; it is **not** wired to a CMS. Query/env names that mention `sanity-*` or `SANITY_PREVIEW_SECRET` exist only for URL compatibility with external tools—do not introduce Sanity or CMS packages unless product requirements change explicitly.

## Architecture

Single-page workbench (`app/page.tsx` → `components/workbench/Workbench.tsx`) that generates a neutral color system.

**Engine (`lib/neutral-engine/`)** — pure, framework-free, barrel export `lib/neutral-engine/index.ts`. Pipeline:

1. `globalScale.ts` — `buildGlobalScale(GlobalScaleConfig)` → ordered OKLCH ramp (`GlobalSwatch[]`). Index 0 is lightest, last is darkest. Length clamped `[8, 48]` via `clampGlobalScaleSteps`.
2. `systemMap.ts` — `deriveSystemTokens(global, SystemMappingConfig)` per `themeMode`. Light and dark elevated use separate `*Start` / `*Count` / `*StepInterval`. Always `clampSystemMappingToLadderLength` first so picks stay in `[0, n−1]` (exception: `darkFillStart` may be `−1`).
3. `effectiveMapping.ts` — `applyContrastEmphasisToSystemMapping` scales `contrastDistance` (`subtle` / `default` / `strong` / `inverse`). Must run **before** token derivation so preview, UI, and exports match.
4. `semanticNaming.ts` — design-system dot-path roles: **surface** elevation (`surface.sunken` … `surface.overlay`, plus `surface.brand` for on-brand planes and `surface.inverse`); **text** hierarchy (`text.default` … `text.disabled`, plus `text.on` on inverse/bold/brand surfaces); **border** (`border.default` / `subtle` / `strong` from stroke count, plus auto `border.focus` = max-contrast flip vs `surface.default`); `state.hover`, `overlay.scrim`, `emphasis.*`. `isInversePairRole` gates `surface.inverse` + `text.on` out of “standard ladder” UIs; `isBorderFocusRole` identifies `border.focus`.
5. `exportFormats.ts` — JSON, CSS variables, CSV, Tailwind v4 `@theme inline`. Primitives as `--color-neutral-*`; tier-2 semantics as `--color-surface-default`, `--color-text-on`, `--color-border-focus`, etc. (dot → hyphen via `semanticColorVarName` / `tokenCssVarName`). Tokens are **runtime-swappable** via `[data-theme="light"]` / `[data-theme="dark"]` in the CSS export.

**Workbench (`hooks/useNeutralWorkbench.ts`)** — single state orchestrator; all controls go through this hook.

- **All input changes are synchronous** — one token derivation + CSS write per commit. `useTransition` / `useDeferredValue` were intentionally removed from this hook (see the file-header comment): concurrent scheduling loses to Chromium's 1Hz `rAF` / `useEffect` throttle on unfocused windows, turning one-frame updates into minute-long stalls. Do not reintroduce deferred scheduling without re-litigating that trade-off.
- `inputBusy` is kept on the return surface for API compatibility but is **always `false`**. Do not wire new loading UI to it.
- CSS variable writes live in `components/providers/LiveThemeStyles.tsx` and use **`useLayoutEffect`** (not `useEffect`) so the paint isn't deferred into the 1Hz throttle window.
- Always derive **both** `lightTokens` and `darkTokens` (export and theme panels), including in `focus` comparison mode.
- `effectiveMappingConfig` is canonical for any UI that shows resolved indices; it must match what `deriveSystemTokens` receives.

**UI:** `Workbench.tsx` — preview + inspector. `WorkbenchControlsShell.tsx` + `BuilderControlsSections.tsx` — Scale → Contrast & role mapping → Inspect → Export. `components/sections/*` — section bodies; `components/preview/*` — palettes/tables; `components/viz/*` — ladders and offset diagrams.

**Presets:** dispatch `neutral-system:load-preset` with `detail: { globalConfig, systemConfig }`. Workbench applies `migrateSystemMappingConfig` and `clampGlobalScaleSteps`.

## Conventions

- **Derived ladder picks:** do not reimplement in components. Use `systemMap.ts` (`pickLightIndices`, `pickDarkIndices`, `pickDarkStrokeTextIndices`, `previewResolvedRoleIndices`, `mirrorRampIndex`).
- **Clamping:** when `steps` changes, `clampSystemMappingToLadderLength` before using `SystemMappingConfig`.
- **Roles:** dot-path strings (`surface.default`, `text.on`) as `SystemToken.id` / `name` / `role`. Do not pre-flatten for UI; export layer rewrites names. WCAG-oriented surface×text pairings live in `contrastContracts.ts` (`SURFACE_TEXT_CONTRACTS`).
- **Color on the React surface is `SerializedColor` only.** `GlobalSwatch` and `SystemToken` carry `serialized: SerializedColor`; they do **not** carry a live `colorjs.io` `Color` instance. Never add `Color` to a type consumed by components, hooks, or React state — that leaks the colorjs.io prototype graph into DevTools snapshots.
- **When Color math is unavoidable** (WCAG contrast, ΔE, OKLCH coord reads), reparse at the call site with `parseColorFromSerialized(s.serialized)` or `oklchCoordsFromSerialized(s.serialized)` from `lib/neutral-engine/serialize.ts`. Create `Color` instances only inside the engine or at the leaf of a memoized selector.
- **Engine-side Color creation** always via `new Color(...)` + `serializeColor`. Use `SerializedColor.inSrgbGamut` for gamut flags; don't re-check.
- **OKLCH strings:** `oklch(L% C H)` with `none` for achromatic hue (`buildOklchString`); match in new CSS output.
- **Style:** single quotes, no semicolons, trailing commas, 2-space indent, `type` imports. Prefer `'use client'` for interactive workbench code; omit on `app/layout.tsx` and engine modules.
- **Tailwind v4 only** — no `tailwind.config.*`. Theme in `@theme` in `app/globals.css`. PostCSS: `@tailwindcss/postcss`.
- **Debug instrumentation** lives in `lib/debug/presetDebug.ts`. `presetDebugEnabled()` is hard-gated to `process.env.NODE_ENV === 'development'` so a stale URL param, localStorage flag, or window flag can never cost a prod user. Route new debug log sites through `presetDebugEnabled()` to preserve the single kill-switch.

## Cursor Agent / Composer behavior

- **Verify before claiming done:** run `pnpm type-check`; for non-trivial changes, run `pnpm build` as well.
- **Keep diffs focused:** change only what the task requires; avoid drive-by refactors.
- **Follow existing patterns:** repo-relative paths, same component and hook structure as neighboring files.

## Deployment

Production on Vercel (`vercel.json`: `framework: nextjs`; Vercel auto-detects pnpm from `pnpm-lock.yaml` + the `packageManager` field in `package.json`). `next.config.mjs` pins Turbopack `root` when parent dirs may contain unrelated lockfiles.
