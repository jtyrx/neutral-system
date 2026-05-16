# CLAUDE.md
<!-- Keep this file compact — it is loaded on every session. -->

## Commands

Use `pnpm`; `pnpm-lock.yaml` and `package.json#packageManager` are authoritative.

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
pnpm test              # vitest run (lib/**/*.test.ts only, node env)
pnpm test:watch        # vitest interactive watch
```

Run a single test file: `pnpm test lib/neutral-engine/globalScale`

Run `pnpm type-check` before claiming done. Run `pnpm test` after engine changes and `pnpm build` for non-trivial or broad changes.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, `colorjs.io`, `@base-ui/react`, `sonner`. Alias `@/*` resolves from repo root. UI primitives are shadcn-style wrappers over Base UI, not Radix. Do not add Radix, Sanity, GROQ, or another CMS unless explicitly requested.

For Next.js-specific work, read only the relevant local docs under `.next-docs` first. If docs are missing, run `npx @next/codemod agents-md --output AGENTS.md`.

## Architecture

Two routes:

- `app/page.tsx` → `components/workbench/Workbench.tsx` — main neutral system builder.
- `app/picker/page.tsx` → `components/picker/OklchPickerWorkbench.tsx` — standalone OKLCH color picker.

Engine code in `lib/neutral-engine/` is pure and framework-free:

- `globalScale.ts`: `buildGlobalScale`; index `0` is lightest, last is darkest; steps clamp to `[8, 48]`.
- `systemMap.ts`: `deriveSystemTokens`; use `clampSystemMappingToLadderLength` before deriving. `darkFillStart` may be `-1`.
- `effectiveMapping.ts`: apply contrast emphasis before token derivation.
- `semanticNaming.ts`: role ids stay as dot paths such as `surface.default`, `text.on`, `border.focus`.
- `exportFormats.ts`: JSON, CSS, CSV, Tailwind v4. Light tier-1 exports as `--color-neutral-*`; dark advanced tier-1 exports reversed as `--color-neutral-dark-<displayIndex>` where `0` is darkest.
- `okhsl.ts`: OKHSL is a view over canonical OKLCH config, not parallel state.
- `gamutProbing.ts`: probes display-P3 / sRGB gamut boundaries for a given OKLCH.
- `pickerConfig.ts`: derives picker-specific config from workbench state.
- `displayGamut.ts`: gamut detection utilities.

### State and providers

Workbench state is centralized in `hooks/useNeutralWorkbench.ts`. Components access it via `NeutralWorkbenchProvider` context (`components/providers/NeutralWorkbenchProvider.tsx`) — do not call `useNeutralWorkbench` directly inside components. Keep input changes synchronous; do not reintroduce `useTransition` or `useDeferredValue` without revisiting the Chromium 1Hz throttle issue. `inputBusy` remains API-compatible and always `false`.

CSS variable writes live in `components/providers/LiveThemeStyles.tsx` and use `useLayoutEffect`. `next-themes` drives the `light`/`dark` class; `WorkbenchThemeBridge` (inside the provider) syncs it to `previewTheme`.

State is persisted to `localStorage` via `lib/workbench/workbenchStorage.ts` (key: `neutral-system:workbench:v1`). Presets also load by dispatching `neutral-system:load-preset` with `{ globalConfig, systemConfig }`. Draft-mode route/env names that mention Sanity are URL-compatibility plumbing only.

### Control center

`components/control-center/` hosts a floating control panel system: `ControlCenter.tsx` orchestrates a magnifying dock (`dock/`) and detachable panels (`panel/`) with their own `ControlCenterPanelContext`. Picker state is managed separately in `hooks/useOklchPickerWorkbench.ts`, bridged to the main workbench via `hooks/useWorkbenchAdapter.ts`.

### Workbench components (`components/workbench/**`)

Logically distinct control regions are extracted as named components, not inlined in their parent. Example: `ComparisonLayoutPicker.tsx` and `InspectionToggle.tsx` rather than inline JSX in `WorkbenchHeader.tsx`. Headers and shells read as orchestration; controls are independently composable.

## Token Rules

- React-facing color data must be `SerializedColor`, never live `Color` instances.
- For color math, reparse at leaf call sites with helpers from `lib/neutral-engine/serialize.ts`.
- Do not recompute derived ladder picks in components; import helpers from `systemMap.ts`.
- Dark display index is `n - 1 - sourceGlobalIndex`; use `primitiveNeutralExportName(global, idx, tier1ExportMode?)`.
- `--chrome-*` mixers come from `chromeAliases.ts`; legacy `--ns-*` tokens stay thin aliases only.
- Role ids are dot paths internally; exports hyphenate through `semanticColorVarName`.
- Downloadable JSON omits preview-only custom brand and optional emphasis tokens; CSS/Tailwind omit custom brand.

## UI And Styling

- Tailwind v4; tokens in `app/globals.css`; no `tailwind.config.*`.
- `cn()` from `@/lib/cn` (workbench) or `@/lib/utils` (ui primitives); never string-concatenate classes.
- `nsb-lg:`/`nsb-xl:` for workbench layout breakpoints; viewport breakpoints for shell/mobile only.
- Style: single quotes, no semicolons, trailing commas, 2-space indent, `type` imports.

### UI Primitives (`components/ui/**`)

`components/ui/AGENTS.md` is authoritative. Key rules that prevent regressions:

- **`displayName` required** on every exported component function.
- **No CSS selector hacks** to suppress sub-elements (`**:data-[slot=...]`, `*:hidden`). Use conditional render: `{showsIndicator(variant) && <Indicator />}`.
- **Variant context** cascades via inline `React.createContext` in the same file; the context object is never exported.
- **All primitives are single flat `.tsx` files** — no subdirectories, no barrel `index.ts`.

## Debugging

Debug instrumentation lives in `lib/debug/presetDebug.ts`. Route new debug logs through `presetDebugEnabled()`, which is gated to development.

## Change Discipline

Keep diffs focused and preserve existing patterns. Do not reformat or refactor unrelated files.
