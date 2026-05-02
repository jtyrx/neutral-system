# components/ui Guardrails

This file is the **persistent source of truth** for agent work under `components/ui/**`. Root [`AGENTS.md`](../../AGENTS.md) and [`CLAUDE.md`](../../CLAUDE.md) defer here for this folder.

## Instruction Hierarchy

When instructions conflict, use this order:

1. **Task prompt** (explicit one-off directions)
2. **This file** (`components/ui/AGENTS.md`) for anything under `components/ui/**`
3. **Root** [`AGENTS.md`](../../AGENTS.md) or [`CLAUDE.md`](../../CLAUDE.md)
4. General coding defaults

For `components/ui/**`, treat this file as authoritative unless the task prompt explicitly overrides it.

## Scope

These rules apply to all files under `components/ui/**`.

This folder holds shared UI primitives and reusable design-system building blocks (shadcn-style wrappers around **Base UI**). Changes here can affect the entire app—keep edits small, compatible, accessible, and aligned with neighboring files.

## Component Philosophy

- Prefer shadcn/ui-style wrappers over one-off UI implementations.
- Use **Base UI** primitives from `@base-ui/react` (matching subpaths used in this folder) for interactive components.
- Do **not** add `@radix-ui/*` or mix Radix and Base UI in the same component family unless the task explicitly requires a repo-wide migration.
- Preserve public component APIs unless the task is specifically to change them.
- Avoid unnecessary rewrites, visual churn, and unrelated styling changes.

## Accessibility Requirements

- Preserve keyboard navigation, focus behavior, ARIA, and disabled states expected from the underlying primitive.
- Prefer primitive-provided accessibility over hand-rolled ARIA.
- Keep visible focus styles (e.g. `focus-visible:border-ring`, `focus-visible:ring-*`) consistent with existing components.
- Do **not** nest interactive elements (e.g. `button` inside `button`).
- For popovers, menus, selects, dialogs, tooltips, and toolbars: preserve correct trigger ↔ content relationships and portal/positioner structure.
- Icon-only controls must have an accessible name via visible text, `aria-label`, or an equivalent pattern.

## State Management

- Support **controlled** and **uncontrolled** usage when the primitive supports both; do not drop that flexibility without an explicit API change task.
- Avoid duplicating state the primitive already manages (`open`, `value`, `checked`, etc.).
- Avoid side effects in render; use effects only when synchronizing with external systems is required.

## Styling Rules

- Merge classes with `cn()` from `@/lib/utils`—never concatenate class strings by hand.
- Use **Tailwind v4** and existing **design tokens** / CSS variables (`bg-background`, `text-foreground`, `border-border`, `bg-popover`, `text-muted-foreground`, `ring-ring`, etc.).
- Prefer **theme utilities** backed by `@theme inline` tokens (e.g. `rounded-control`, `shadow-raised`, `shadow-overlay`, `border-hairline`, `bg-(--chrome-chip)`) instead of literals.
- Use **`--chrome-*`** mixers and **`--color-*`** semantics for bespoke `bg-(--token)`/`border-(--token)` escapes; **`--ns-*`** is legacy alias only—do not introduce new `--ns-*` definitions in components or new `@utility` blocks.
- Do **not** hardcode raw hex, `rgb`, `hsl`, or `oklch` literals in component styles **except** for **computed inline styles** that preview a dynamic color value (e.g. ramp swatches using `serialized.hex`).
- Scope style changes to the requested behavior; avoid drive-by visual tweaks.
- Preserve `data-slot`, `data-*`, and state/data attributes that existing styles or parent layouts rely on.
- For variants, use **`class-variance-authority` (`cva`)** when the file already uses that pattern.

## Three-layer styling architecture

This repo uses a hybrid model aligned with Tailwind CSS v4’s CSS-first `@theme`:

### Layer 1 — `@theme` / `@theme inline` (`app/globals.css`)

- **`@theme`**: foundational motion, easing, sidebar layout widths, shared keyframes referenced by Tailwind animations.
- **`@theme inline`**: Tailwind-facing bridge tokens—radii (`--radius-control`, `--radius-sm` …), **`--shadow-*`**, **`--spacing-control-*`**, **`--color-*`** shadcn bridge, **`--text-color-*`** / **`--background-color-*`** / **`--border-color-*`** maps to **`--color-*`** / **`--chrome-*`**.
- **Tier-1 / live tier-2** (`--color-neutral-*`, theme blocks) stay on `:root` / `[data-theme]` and **`LiveThemeStyles`**—don’t duplicate them as literals inside `@theme inline`.

### Layer 2 — `components/ui/*` (this folder)

- Owns **~90% of visual styling**: wrap **Base UI** primitives, compose with `Portal → Positioner → Popup` where required, expose a stable named API.
- Shared floating **Popup** class fragments (motion + elevated surface): [floating-popup-styles.ts](floating-popup-styles.ts) — used by select, popover, dropdown menu, and tooltip; keep visual parity when editing.
- Consume tokens via **`className`** + Tailwind utilities; keep **Workbench / section / page** code free of primitive-specific styling churn.
- Defer **complex reusable CSS behavior** (see Layer 3) instead of stuffing long `className` strings—unless it’s genuinely one-off.

### Layer 3 — `@utility` (`app/globals.css`)

- Reserve for **cross-cutting CSS patterns**: multi-step chrome recipes, keyframe-backed motion, **`data-*` / state** selectors, scroll/focus overlays, gradients that would be brittle in JSX.
- **Do not** use `@utility` for basic one-component recipes—those belong in `components/ui/` / `cva`.

### Placement quick reference

| Concern                         | Owner                          |
|-------------------------------|--------------------------------|
| Global design-token registry   | `@theme` / `@theme inline`      |
| Base UI visuals + variants     | `components/ui/`                |
| Repeated complex CSS behaviors | `@utility` + `@keyframes`      |
| Interactive product layout     | `components/workbench/` etc.     |

## TypeScript Rules

- Keep **strict** types; avoid `any`.
- Prefer **primitive prop types** from Base UI (e.g. `SelectPrimitive.Trigger.Props`) when wrapping parts.
- Use `React.ComponentProps<'button'>`, `React.ComponentProps<'div'>`, or `React.ComponentProps<typeof SomePrimitive>` where appropriate.
- Use `type` imports for type-only symbols.
- Preserve exported prop names, variant keys, and defaults unless the task explicitly changes the public API.

## Composition Rules

- Preserve patterns used in this folder: **`asChild`**, **`useRender`**, **`render` props**, slots, and `data-slot` markers.
- **`asChild` on triggers:** `TooltipTrigger`, `PopoverTrigger`, `SheetTrigger`, and `DropdownMenuTrigger` accept optional **`asChild`** and map it to Base UI’s **`render`** prop (single valid element child), matching Radix-style composition without nested interactive elements.
- **Forward refs** when wrapping primitives or DOM nodes that callers need to measure or focus.
- For floating/composite primitives, keep **Portal → Positioner → Popup** (or equivalent) structure intact unless migrating deliberately.
- Keep decorative icons non-interactive (`pointer-events-none` where appropriate).
- Do not wrap triggers in extra interactive wrappers that break semantics or focus.

## Import Rules

- `cn` from `@/lib/utils`.
- Base UI from `@base-ui/react/...` subpaths consistent with neighboring files.
- Icons from `lucide-react` when icons are needed.
- Do not introduce new primitive libraries without explicit approval.
- Match import style (e.g. quotes) to the file you are editing.

## File Naming and Exports

- Use **kebab-case** filenames (e.g. `dropdown-menu.tsx`, `toggle-group.tsx`).
- Prefer **named exports** for public components.
- Keep `data-slot` values and export names stable; downstream styles and tests may depend on them.
- Do not move files or rename public exports without a coordinated task.

## Public API Preservation

- Treat props, `cva` variants, sizes, named exports, and composite part names as **public API**.
- Do not remove variants or change defaults without checking call sites.
- Add new variants sparingly and only when needed; document intent in the task or PR if non-obvious.

## Change Safety

- Keep diffs limited to the requested component or family.
- Do not reformat unrelated components in the same change.
- After substantive edits: run `pnpm type-check`. For broad primitive changes, also run `pnpm build` (per root docs).
- When bumping **`@base-ui/react`**: re-read release notes for breaking changes to **`render`**, trigger/popup APIs, and part names. Re-verify escaped exports **`SelectPrimitives`** ([select.tsx](select.tsx)) and raw **`Toolbar`** parts (`Group`, `Link`, `Input` from the primitive namespace in [toolbar.tsx](toolbar.tsx)) against call sites and types.

## Review Checklist

Before finishing work in `components/ui/**`, confirm:

- [ ] Keyboard and focus behavior still work; disabled and invalid states still make sense.
- [ ] Controlled/uncontrolled behavior is preserved where applicable.
- [ ] Refs still attach to the expected element.
- [ ] No nested interactive elements; composition (`asChild` / `render` / slots) remains valid.
- [ ] Styling uses `cn()` and design tokens; no unrelated visual changes.
- [ ] No unintended breaking changes to exports, variants, or `data-slot` contracts.
