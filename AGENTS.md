# AGENTS.md

Instructions for Cursor Agent and Composer. Claude Code uses `CLAUDE.md`. Keep this file small: add details only when they must be loaded on every agent turn.

## Commands

Use `pnpm`; `pnpm-lock.yaml` and `package.json#packageManager` are authoritative.

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
pnpm test
```

Run `pnpm type-check` before claiming done. Run `pnpm test` after engine changes and `pnpm build` for non-trivial or broad changes.

**Before running `type-check` or `build` in CI / agent environments**, clear the Next.js cache first to avoid stale artifacts being scanned:

```bash
rm -rf .next && pnpm type-check
rm -rf .next && pnpm build
```

Production builds must be network-independent. Vendor required runtime assets (especially fonts) instead of relying on build-time fetches.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, `colorjs.io`, `sonner`, shadcn-style UI wrappers over `@base-ui/react` primitives. Alias `@/*` resolves from repo root. Do not add Radix or a CMS unless explicitly requested.

For Next.js-specific work, read only the relevant local docs under `.next-docs` first. If docs are missing, run `npx @next/codemod agents-md --output AGENTS.md`.

## Architecture

Single-page workbench: `app/page.tsx` -> `components/workbench/Workbench.tsx`.

Engine code in `lib/neutral-engine/` is pure and framework-free. Main flow:

- `globalScale.ts`: `buildGlobalScale`; index `0` is lightest, last is darkest; steps clamp to `[8, 48]`.
- `systemMap.ts`: `deriveSystemTokens`; always use `clampSystemMappingToLadderLength` before deriving. `darkFillStart` may be `-1`.
- `effectiveMapping.ts`: apply contrast emphasis before token derivation.
- `semanticNaming.ts`: role ids stay as dot paths such as `surface.default`, `text.on`, `border.focus`.
- `exportFormats.ts`: JSON, CSS, CSV, Tailwind v4. Light tier-1 exports as `--color-neutral-*`; dark advanced tier-1 exports reversed as `--color-neutral-dark-<displayIndex>` where `0` is darkest.

Workbench state is centralized in `hooks/useNeutralWorkbench.ts`. Keep input changes synchronous; do not reintroduce `useTransition` or `useDeferredValue` there without revisiting the Chromium 1Hz throttle issue. `inputBusy` remains API-compatible and always `false`. CSS variable writes live in `components/providers/LiveThemeStyles.tsx` and use `useLayoutEffect`.

State is in-browser only. Presets load by dispatching `neutral-system:load-preset` with `{ globalConfig, systemConfig }`. `app/api/draft-mode/enable`, if present, is generic preview plumbing, not CMS integration.

## Token Rules

- React-facing color data must be `SerializedColor`, never live `Color` instances.
- For color math, reparse at leaf call sites with helpers from `lib/neutral-engine/serialize.ts`.
- Do not recompute derived ladder picks in components; import helpers from `systemMap.ts`.
- Dark display index is `n - 1 - sourceGlobalIndex`; use `primitiveNeutralExportName(global, idx, tier1ExportMode?)`.
- `--chrome-*` mixers come from `chromeAliases.ts`; legacy `--ns-*` tokens stay thin aliases only.
- Downloadable JSON omits preview-only custom brand and optional emphasis tokens; CSS/Tailwind omit custom brand.

## UI And Styling

- Tailwind v4 only. Theme tokens live in `app/globals.css`; no `tailwind.config.*`.
- Use shadcn-style components in `components/ui` backed by `@base-ui/react`.
- For files in `components/ui/**`, read `components/ui/AGENTS.md`; that file overrides this section.
- Use `nsb-lg:` / `nsb-xl:` container variants for workbench layout; reserve viewport breakpoints for shell/mobile behavior.
- Use `cn()` for class merging. Style: single quotes, no semicolons, trailing commas, 2-space indent, `type` imports.

## Debugging

Debug instrumentation lives in `lib/debug/presetDebug.ts`. Route new debug logs through `presetDebugEnabled()`, which is gated to development.

## Change Discipline

Keep diffs focused and preserve existing patterns. Do not reformat or refactor unrelated files.
