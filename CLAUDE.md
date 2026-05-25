# CLAUDE.md
<!-- Loaded on every session — every line must earn its place. -->

## Non-Negotiables

Read this block before touching any file. These are the highest-cost mistakes.

- Package manager: `pnpm` only. `pnpm-lock.yaml` is the lock authority.
- No Radix, no Sanity, no GROQ, no additional CMS — unless explicitly requested.
- No runtime barrel imports anywhere in `components/` or `lib/`. New barrel files must be `export type` only.
- `lib/neutral-engine/index.ts` is type-only. Import runtime values directly from source files.
- `cn()` from `@/lib/cn` (workbench) or `@/lib/utils` (ui primitives). Never string-concatenate classes.
- React-facing color data must be `SerializedColor`. Never pass live `Color` instances to components.
- Do not call `useNeutralWorkbench` directly inside components. Access via `NeutralWorkbenchProvider` context only.
- Do not reintroduce `useTransition` or `useDeferredValue` without revisiting the Chromium 1Hz throttle issue. `inputBusy` is always `false` — API-compatible, do not change.
- `displayName` required on every exported component function in `components/ui/`.
- No CSS selector hacks to suppress sub-elements (`**:data-[slot=...]`, `*:hidden`). Use conditional render: `{showsIndicator(variant) && <Indicator />}`.
- Variant context cascades via inline `React.createContext` in the same file. Never export the context object.
- Do not recompute derived ladder picks in components. Import helpers from `systemMap.ts`.

---

## Engineering Principles

- Server Components by default. Add `'use client'` only at the smallest interactive leaf.
- Treat caching as explicit architecture, not incidental behavior.
- Colocate data fetching with the component that owns the data.
- Build UI as small, accessible, composable primitives. Separate primitives / patterns / product components.
- Tailwind expresses. CSS variables govern. Components compose. Never use utility classes to encode design decisions that belong in tokens.
- Use TypeScript to encode valid design-system usage — discriminated unions for variants, `satisfies` for token maps.
- Prefer boring, traceable code. Optimize for readability and deletion, not abstraction.
- Mutations use Server Actions. Colocate actions with the forms that invoke them. `revalidateTag` is the handshake between a mutation and its affected cache.

---

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check                              # run before claiming done
pnpm test                                    # vitest, node env, lib/**/*.test.ts only
pnpm test:watch
pnpm test lib/neutral-engine/globalScale     # single file
```

Verification gate: `pnpm type-check` → `pnpm test` (after engine changes) → `pnpm build` (broad changes).

---

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS v4 · `colorjs.io` · `@base-ui/react` · `sonner`

Alias `@/*` resolves from repo root. UI primitives are shadcn-style wrappers over **Base UI** — not Radix.

For Next.js-specific work, read `.next-docs` first. If missing: `npx @next/codemod agents-md --output .next-docs/AGENTS.md`.

---

## Architecture

Two routes:

- `app/page.tsx` → `components/workbench/Workbench.tsx` — neutral system builder
- `app/picker/page.tsx` → `components/picker/OklchPickerWorkbench.tsx` — OKLCH color picker

### Engine (`lib/neutral-engine/`) — pure, framework-free

| File | Key constraint |
|---|---|
| `globalScale.ts` | `buildGlobalScale`; light ramps use index `0` = lightest; dark ramps use index `0` = darkest via `dark-to-light`; steps clamp `[8, 48]` |
| `systemMap.ts` | `deriveSystemTokens`; always run `clampSystemMappingToLadderLength` before deriving; `darkFillStart` may be `-1` |
| `effectiveMapping.ts` | Apply contrast emphasis **before** token derivation |
| `semanticNaming.ts` | Role ids are dot paths internally: `surface.default`, `text.on`, `border.focus` |
| `exportFormats.ts` | Light tier-1 → `--color-neutral-*`; dark advanced tier-1 → `--color-neutral-dark-<label>` where low label = darkest; simple dark scopes override `--color-neutral-*` |
| `okhsl.ts` | **OKHSL is a view over canonical OKLCH config — not parallel state** |
| `gamutProbing.ts` | Probes display-P3 / sRGB gamut boundaries |
| `pickerConfig.ts` | Derives picker config from workbench state |
| `displayGamut.ts` | Gamut detection utilities |

### State

- Workbench state: `hooks/useNeutralWorkbench.ts` → exposed only via `NeutralWorkbenchProvider`
- CSS variable writes: `components/providers/LiveThemeStyles.tsx` using `useLayoutEffect`
- Theme: `next-themes` drives `light`/`dark` class; `WorkbenchThemeBridge` syncs to `previewTheme`
- Persistence: `localStorage`, key `neutral-system:workbench:v1` (`lib/workbench/workbenchStorage.ts`)
- Presets: dispatch `neutral-system:load-preset` with `{ globalConfig, systemConfig }`
- Picker state: `hooks/useOklchPickerWorkbench.ts`, bridged via `hooks/useWorkbenchAdapter.ts`

### Workbench components (`components/workbench/**`)

Extract logically distinct control regions as named components — never inline in parents. Headers and shells are orchestration; controls are independently composable.

---

## Import Policy

```ts
// ✅ Direct source import — always
import { deriveSystemTokens } from '@/lib/neutral-engine/systemMap'
import { buildGlobalScale } from '@/lib/neutral-engine/globalScale'

// ✅ Type-only barrel — allowed
import type { SystemTokens } from '@/lib/neutral-engine'

// ✅ UI primitive with explicit extension
import { Button } from '@/components/ui/button.tsx'

// ❌ Runtime barrel — never
import { deriveSystemTokens } from '@/lib/neutral-engine'
import { Button } from '@/components/ui'
```

`components/ui/` is flat files only — `components/ui/<name>.tsx`. No subdirectories, no `index.ts`.

---

## Token Rules

- Scale indices are theme-directed: light ramps are white-first (`0` = lightest), dark ramps are black-first (`0` = darkest). Use `primitiveNeutralExportName(global, idx, tier1ExportMode?)` for tier-1 CSS names.
- `--chrome-*` mixers from `chromeAliases.ts`. Legacy `--ns-*` tokens stay as thin aliases only.
- Role ids are dot paths internally; exports hyphenate via `semanticColorVarName`.
- For color math, reparse at leaf call sites using helpers from `lib/neutral-engine/serialize.ts`.
- Downloadable JSON: omits preview-only custom brand and optional emphasis tokens.
- CSS/Tailwind exports: omit custom brand.

---

## Styling

- Tailwind v4. Tokens in `app/globals.css`. No `tailwind.config.*`.
- `nsb-lg:` / `nsb-xl:` for workbench layout breakpoints. Viewport breakpoints for shell and mobile only.
- Code style: single quotes, no semicolons, trailing commas, 2-space indent, `type` imports.

`components/ui/AGENTS.md` is authoritative for UI primitive rules.

---

## Debugging

Route all new debug logs through `presetDebugEnabled()` in `lib/debug/presetDebug.ts`. Development-gated only.

---

## Change Discipline

- Keep diffs focused. Do not reformat or refactor unrelated files.
- Draft-mode route/env names that mention Sanity are URL-compatibility plumbing only — do not expand them.
- Verification gate before marking done: `pnpm type-check` → `pnpm test` → `pnpm build`.

---

## Sub-Agents

Project-specific agents in `.claude/agents/`. Dispatch with the `Agent` tool.

| Agent | When to use |
|---|---|
| `engine-reviewer` | After editing any file in `lib/neutral-engine/` — checks all CLAUDE.md engine invariants |
| `ui-compliance-runner` | After writing or substantially editing any file in `components/` — runs sweep.sh + fixes violations + type-check |
