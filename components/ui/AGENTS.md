# components/ui AGENTS.md

Rules for shared UI primitives under `components/ui/**`. These override root `AGENTS.md` / `CLAUDE.md` for this folder.

## Priorities

1. Task prompt
2. This file
3. Root agent file
4. General defaults

This folder wraps Base UI primitives in shadcn-style components. Changes here affect the app broadly, so keep edits small, compatible, accessible, and aligned with neighboring files.

## Component Rules

- Use `@base-ui/react` subpaths already used in this folder.
- Do not add Radix or mix primitive libraries without an explicit repo-wide migration.
- Preserve public APIs: exported names, props, variants, defaults, `data-slot` values, and composite part names.
- Support controlled/uncontrolled use when the primitive supports both.
- Avoid duplicating primitive-managed state such as `open`, `value`, or `checked`.
- Use existing composition patterns: `asChild`, Base UI `render`, `useRender`, slots, refs, and `data-*` state attributes.
- For floating primitives, preserve the required portal/positioner/popup structure.

## Accessibility

- Preserve keyboard navigation, focus behavior, ARIA, disabled states, and invalid states.
- Prefer primitive-provided accessibility over hand-rolled ARIA.
- Do not nest interactive elements.
- Icon-only controls need an accessible name.
- Keep visible focus styles consistent with neighboring components.

## Styling

- Merge classes with `cn()` from `@/lib/utils`; never string-concatenate class names.
- Use Tailwind v4 utilities and existing tokens: `bg-background`, `text-foreground`, `border-border`, `bg-popover`, `text-muted-foreground`, `ring-ring`, etc.
- Prefer theme-backed utilities such as `rounded-control`, `shadow-raised`, `shadow-overlay`, `border-hairline`, and `bg-(--chrome-chip)`.
- Use `--chrome-*` and `--color-*` for bespoke CSS variable escapes. Do not introduce new `--ns-*` usage.
- Do not hardcode raw color literals except computed inline preview values such as dynamic swatches.
- Use `cva` when the file already uses it.
- Keep reusable popup surface/motion styles aligned with `floating-popup-styles.ts`.

## TypeScript And Imports

- Keep strict types; avoid `any`.
- Prefer primitive prop types where useful, otherwise `React.ComponentProps<...>`.
- Use type-only imports for types.
- Import icons from `lucide-react` when icons are needed.
- Match local import and quote style.

## CSS Ownership

- `app/globals.css`: global `@theme`, `@theme inline`, keyframes, and cross-cutting `@utility` patterns.
- `components/ui/*`: Base UI wrappers, visual variants, and most component styling.
- Product layout belongs in workbench/section/page components, not shared primitives.

## Verification

After substantive edits, run `pnpm type-check`. For broad primitive changes, also run `pnpm build`.

Before finishing, check:

- Keyboard/focus behavior still works.
- Controlled/uncontrolled behavior is preserved.
- Refs still attach to expected elements.
- No nested interactive elements.
- Styling uses tokens and `cn()`.
- No unintended public API or `data-slot` breakage.
