# components/ui AGENTS.md

Rules for shared UI primitives under `components/ui/**`. These override root `AGENTS.md` / `CLAUDE.md` for this folder.

## Priorities

1. Task prompt
2. This file
3. Root agent file
4. General defaults

This folder wraps Base UI primitives in shadcn-style components. Changes here affect the app broadly, so keep edits small, compatible, accessible, and aligned with neighboring files.

## File Shape

Each primitive is a **single flat file** at `components/ui/<name>.tsx`:

```
components/ui/
├── button.tsx
├── slider.tsx
├── tooltip.tsx
├── floating-popup-styles.ts   — shared style utility; not a component
└── ...
```

**No subdirectories. No `index.ts` barrel files.** Do not create a `components/ui/<name>/` folder for UI primitives.

**Import convention:** consumers always import with the explicit `.tsx` extension:

```tsx
import { Button } from '@/components/ui/button.tsx'
import { Slider } from '@/components/ui/slider.tsx'
```

**`floating-popup-styles.ts`** is a shared style utility at the `components/ui/` root. Import it from `'./floating-popup-styles'` (relative) within sibling UI files, or `@/components/ui/floating-popup-styles` from outside.

## Component Rules

- Use `@base-ui/react` subpaths already used in this folder.
- Do not add Radix or mix primitive libraries without an explicit repo-wide migration.
- Preserve public APIs: exported names, props, variants, defaults, `data-slot` values, and composite part names.
- Support controlled/uncontrolled use when the primitive supports both.
- Avoid duplicating primitive-managed state such as `open`, `value`, or `checked`.
- Use existing composition patterns: `asChild`, Base UI `render`, `useRender`, slots, refs, and `data-*` state attributes.
- For floating primitives, preserve the required portal/positioner/popup structure.
- Set `displayName` on every exported component: `MyComponent.displayName = 'MyComponent'`. This is required for React DevTools legibility across the design system.

## Variant And Context Propagation

- When a parent component must cascade a `variant` (or similar enum) to children without explicit prop threading, use `React.createContext` inline in the same file. Keep context internal — do not export the context object or provider; export only a `use<Name>()` hook if consumers need to read it.
- The context hook must fall back to a safe default when called outside its provider so standalone child usage doesn't throw: `return React.useContext(Ctx) ?? 'default'`.
- Variant logic must be typed: define a `type MyVariant = NonNullable<VariantProps<typeof myVariants>['variant']>` and use it as the context value type.

## Render Decisions Belong In JSX, Not CSS

- **Never use descendant CSS selectors (`**:data-[slot=...]`, `*:hidden`, etc.) to hide or suppress sub-components.** This mounts invisible DOM nodes and creates fragile coupling to Base UI internal attribute names.
- If a sub-element (indicator, icon, suffix) should not appear for a given variant or state, use a conditional render in JSX: `{shouldShow && <Indicator />}`.
- Document the render condition with a named predicate: `function showsIndicator(variant: MyVariant): boolean`.

## Exports

- Export the component function(s) and their prop types.
- Export CVA variant functions when consumers legitimately extend or restyle the component (e.g. building a custom item on the same scale). Prefix them clearly: `radioGroupVariants`, `radioGroupItemVariants`.
- Do **not** export internal context objects, providers, or implementation-detail helpers.
- Use `type` imports for all type-only references.

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
