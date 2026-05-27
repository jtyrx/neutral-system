# Phase 2A: Block Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all 9 remaining preview blocks from JS-resolved `c.*` inline styles to Tailwind CSS variable utilities, narrow the type layer to `NewBlockColors`, and add a colocated `.chain.ts` for each block.

**Architecture:** Task 0 deletes `ResolvedBlockColors` and narrows `CaseRenderProps` to `NewBlockColors` — TypeScript then flags every `c.*` usage as an error, giving a compiler-driven migration checklist. Tasks 1–9 fix each block in order of complexity (fewest `c.*` fields first), replacing inline styles with CSS var utilities and writing the colocated chain spec. `DataCardBlock` is already migrated and serves as the reference.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS v4 · `pnpm`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/preview/blockTypes.ts` | Modify | Delete `ResolvedBlockColors`; update `CaseRenderProps` → `NewBlockColors` |
| `components/preview/useResolvedBlockColors.ts` | Modify | Narrow return to `NewBlockColors` only |
| `components/preview/blocks/ButtonVariantsBlock.tsx` | Modify | Migrate `c.page` → CSS var; drop `c` |
| `components/preview/blocks/ButtonVariantsBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/FormControlsBlock.tsx` | Modify | Migrate `c.*` → CSS vars; drop `c` |
| `components/preview/blocks/FormControlsBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/ColorTokenInspectorBlock.tsx` | Modify | Migrate `c.*` → CSS vars; drop `c` |
| `components/preview/blocks/ColorTokenInspectorBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/FormFieldBlock.tsx` | Modify | Migrate `c.*` → CSS vars; drop `c` |
| `components/preview/blocks/FormFieldBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/LayoutNavBlock.tsx` | Modify | Migrate `c.*` → CSS vars; drop `c` |
| `components/preview/blocks/LayoutNavBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/CalloutBlock.tsx` | Modify | Migrate neutral `c.*` → CSS vars; keep `c.brand` |
| `components/preview/blocks/CalloutBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/OverlayMenuBlock.tsx` | Modify | Migrate neutral `c.*` → CSS vars; keep `c.scrimBg` |
| `components/preview/blocks/OverlayMenuBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/SurfaceHierarchyBlock.tsx` | Modify | Migrate `c.*` → CSS vars; drop `c` |
| `components/preview/blocks/SurfaceHierarchyBlock.chain.ts` | Create | Chain spec |
| `components/preview/blocks/FeedbackBlock.tsx` | Modify | Migrate neutral `c.*` → CSS vars; keep `c.brand` |
| `components/preview/blocks/FeedbackBlock.chain.ts` | Create | Chain spec |
| `components/preview/previewBlockRegistry.tsx` | Modify | Register all 9 new `chainSpec` imports |

---

## CSS Variable Utility Reference

Tailwind v4 syntax for CSS custom property utilities. Use these everywhere a `c.*` field is removed:

| `c.*` field | Replace with |
|---|---|
| `c.page` bg | `className="bg-(--color-surface-default)"` |
| `c.sunken` bg | `className="bg-(--color-surface-sunken)"` |
| `c.subtle` bg | `className="bg-(--color-surface-subtle)"` |
| `c.raised` bg | `className="bg-(--color-surface-raised)"` |
| `c.overlay` bg | `className="bg-(--color-surface-overlay)"` |
| `c.inverse` bg | `className="bg-(--color-surface-inverse)"` |
| `c.td` color | `className="text-(--color-text-default)"` |
| `c.ts` color | `className="text-(--color-text-subtle)"` |
| `c.tm` color | `className="text-(--color-text-muted)"` |
| `c.tdis` color | `className="text-(--color-text-disabled)"` |
| `c.ton` color | `className="text-(--color-text-on)"` |
| `c.bs` borderColor | `className="border-(--color-border-muted)"` or `style={{borderColor: 'var(--color-border-muted)'}}` |
| `c.bd` borderColor | `className="border-(--color-border-default)"` or `style={{borderColor: 'var(--color-border-default)'}}` |
| `c.bStr` borderColor | `className="border-(--color-border-emphasis)"` or `style={{borderColor: 'var(--color-border-emphasis)'}}` |

**When to use `style` vs `className`:** Use `className` for `background-color`, `color`, and the full `border-color` shorthand. Use `style={{borderColor: 'var(--color-*)'}}` when the element already has a complex `style` object or when the Tailwind utility would fight an existing `border-*` class.

**`c.brand` and `c.scrimBg` stay as inline styles** — they are runtime-computed values that cannot be CSS variables.

---

## Task 0: Narrow type layer — delete ResolvedBlockColors

**Files:**
- Modify: `components/preview/blockTypes.ts`
- Modify: `components/preview/useResolvedBlockColors.ts`

- [ ] **Step 1: Replace `blockTypes.ts` with the narrowed version**

Replace the entire file content with:

```ts
import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export type BlockCaseProps = {
  global: GlobalSwatch[]
  tokenView: TokenView
  brandPlaneOklch: string
  /** `light` for the page-surface theme, `darkElevated` for the raised-dark theme. */
  theme: TokenSelectTheme
  inspection?: boolean | undefined
  onSelectSystem?: ((role: string, theme?: TokenSelectTheme) => void) | undefined
}

/**
 * Two runtime values that cannot be CSS custom properties — everything else
 * is inherited from the [data-preview-theme] ancestor scope.
 */
export type NewBlockColors = {
  /** Runtime brand oklch — varies per workbench config, cannot be a CSS variable */
  brand: string
  /** Alpha-mixed scrim — color-mix() computed from alpha config */
  scrimBg: string
}

export type CaseRenderProps = BlockCaseProps & {c: NewBlockColors}
```

- [ ] **Step 2: Replace `useResolvedBlockColors.ts` with the narrowed version**

Replace the entire file content with:

```ts
'use client'

import {useMemo} from 'react'

import type {NewBlockColors} from '@/components/preview/blockTypes'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export function useResolvedBlockColors(
  global: GlobalSwatch[],
  tokenView: TokenView,
  brandPlaneOklch: string,
): NewBlockColors {
  return useMemo(() => {
    const interactive = tokensForSemanticLayerPublic(tokenView, 'interactive')
    const scrimToken = interactive.find((t) => t.role === 'overlay.scrim')
    const scrimBg =
      scrimToken?.alpha != null && scrimToken.alpha < 1
        ? `color-mix(in oklch, ${scrimToken.serialized.oklchCss} ${Math.round(scrimToken.alpha * 100)}%, transparent)`
        : scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)'
    return {
      brand: trimCssColorValue(brandPlaneOklch) || 'transparent',
      scrimBg,
    }
  }, [global, tokenView, brandPlaneOklch])
}
```

- [ ] **Step 3: Run type-check and confirm errors**

```bash
pnpm type-check 2>&1 | grep "error TS" | wc -l
```

Expected: ~15–25 errors — one per `c.*` usage across the 9 blocks. This is correct. Each error is a migration site that Tasks 1–9 will fix.

- [ ] **Step 4: Commit the type narrowing**

```bash
git add components/preview/blockTypes.ts components/preview/useResolvedBlockColors.ts
git commit -m "refactor(preview): narrow ResolvedBlockColors to NewBlockColors"
```

---

## Task 1: ButtonVariantsBlock

**Files:**
- Modify: `components/preview/blocks/ButtonVariantsBlock.tsx`
- Create: `components/preview/blocks/ButtonVariantsBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

`ButtonVariantsBlock` uses only `c.page` — the background of the scroll wrapper. After migration it doesn't need `c` at all.

- [ ] **Step 1: Migrate ButtonVariantsBlock.tsx**

Replace the component signature and the one `style` usage. The full new file:

```tsx
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'
import {Loader2} from 'lucide-react'

const BUTTON_VARIANTS = [
  {value: 'default', label: 'Default'},
  {value: 'outline', label: 'Outline'},
  {value: 'secondary', label: 'Secondary'},
  {value: 'ghost', label: 'Ghost'},
  {value: 'destructive', label: 'Destructive'},
  {value: 'link', label: 'Link'},
] as const

const BUTTON_SIZES = [
  {value: 'xs', label: 'XS'},
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] as const

const BUTTON_STATE_LABELS = ['Rest', 'Focus', 'Disabled', 'Loading'] as const

export function ButtonVariantsBlock(_props: BlockCaseProps) {
  return (
    <div className="overflow-x-auto rounded-md bg-(--color-surface-default) p-8">
      <div className="min-w-[56rem] space-y-4">
        <div className="grid grid-cols-[5rem_3rem_repeat(4,minmax(7rem,1fr))] gap-8 border-b border-hairline pb-6">
          <div />
          <span className="text-center text-micro font-medium uppercase tracking-wide text-disabled">
            Size
          </span>
          {BUTTON_STATE_LABELS.map((col) => (
            <span key={col} className="text-center text-micro font-medium uppercase tracking-wide text-disabled">
              {col}
            </span>
          ))}
        </div>
        {BUTTON_VARIANTS.map(({value, label}) => (
          <div key={value} className="border-b border-hairline py-2 last:border-b-0">
            {BUTTON_SIZES.map(({value: size, label: sizeLabel}, sizeIndex) => (
              <div key={size} className="grid grid-cols-[5rem_3rem_repeat(4,minmax(7rem,1fr))] items-center gap-8 py-3">
                <span className="font-mono text-micro text-muted">{sizeIndex === 0 ? label : ''}</span>
                <span className="text-center font-mono text-micro text-disabled">{sizeLabel}</span>
                <div className="flex justify-center">
                  <Button variant={value} size={size}>{label}</Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant={value}
                    size={size}
                    className={value === 'destructive' ? 'border-destructive/40 ring-3 ring-destructive/20' : 'border-ring ring-3 ring-ring/50'}
                    tabIndex={-1}
                  >
                    {label}
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button variant={value} size={size} disabled>{label}</Button>
                </div>
                <div className="flex justify-center">
                  <Button variant={value} size={size} disabled>
                    <Loader2 className="animate-spin" />
                    {label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
ButtonVariantsBlock.displayName = 'ButtonVariantsBlock'
```

- [ ] **Step 2: Create ButtonVariantsBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'button-variants',
  entries: [
    {
      element: 'Page background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Neutral canvas behind the button matrix — establishes the baseline against which all button fill, border, and ring tokens are evaluated.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add the import after the existing `dataCardChainSpec` import:

```ts
import {chainSpec as buttonVariantsChainSpec} from '@/components/preview/blocks/ButtonVariantsBlock.chain'
```

Add `chainSpec: buttonVariantsChainSpec` to the `button-variants` entry in `PREVIEW_BLOCK_CASES`.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "ButtonVariants"
```

Expected: no errors for ButtonVariantsBlock.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/ButtonVariantsBlock.tsx components/preview/blocks/ButtonVariantsBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate ButtonVariantsBlock to CSS vars + add chain spec"
```

---

## Task 2: FormControlsBlock

**Files:**
- Modify: `components/preview/blocks/FormControlsBlock.tsx`
- Create: `components/preview/blocks/FormControlsBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.page`, `c.bd`, `c.ts`. After migration, drop `c` entirely.

- [ ] **Step 1: Migrate FormControlsBlock.tsx**

```tsx
'use client'

import {useState} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Input} from '@/components/ui/input.tsx'
import {SliderField} from '@/components/ui/slider.tsx'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group.tsx'

export function FormControlsBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  const [alignValue, setAlignValue] = useState<string[]>(['center'])

  return (
    <div className="space-y-16 rounded-md bg-(--color-surface-default) p-12">
      <div className="grid gap-16 sm:grid-cols-2">
        <div className="space-y-12">
          <div className="space-y-4">
            <label className="text-micro font-medium text-(--color-text-subtle)">Default</label>
            <Input placeholder="Enter a value…" style={{borderColor: 'var(--color-border-default)'}} />
          </div>
          <div className="space-y-4">
            <label className="text-micro font-medium text-(--color-text-subtle)">Disabled</label>
            <Input placeholder="Not editable" disabled />
          </div>
          <div className="space-y-4">
            <label className="text-micro font-medium text-(--color-text-subtle)">Invalid</label>
            <Input aria-invalid defaultValue="bad@value" />
          </div>
        </div>
        <div className="space-y-16">
          <SliderField label="Opacity" defaultValue={[60]} min={0} max={100} />
          <div className="space-y-4">
            <p className="text-micro font-medium text-(--color-text-subtle)">Alignment</p>
            <ToggleGroup
              value={alignValue}
              onValueChange={setAlignValue}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="left">Left</ToggleGroupItem>
              <ToggleGroupItem value="center">Center</ToggleGroupItem>
              <ToggleGroupItem value="right">Right</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>field edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>focus ring</span>
        <SemanticTokenAnnotation role="border.focus" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>placeholder</span>
        <SemanticTokenAnnotation role="text.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
FormControlsBlock.displayName = 'FormControlsBlock'
```

- [ ] **Step 2: Create FormControlsBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'form-controls',
  entries: [
    {
      element: 'Page background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Field edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Default weight field boundary — lighter than border.emphasis, appropriate for non-critical data entry where the control affords editing but doesn\'t demand attention.',
    },
    {
      element: 'Field label',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
      description: 'One step below text.default — labels support the field without competing with the entered value.',
    },
    {
      element: 'Focus ring',
      dtcgPath: 'color.border.focus',
      cssVar: '--color-border-focus',
      usage: 'outline-color',
      description: 'Semantically distinct from border.default — keyboard state must never be ambiguous even on fields that already have a visible border.',
    },
    {
      element: 'Placeholder text',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Lowest-contrast text tier — placeholder is not content, just a hint.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as formControlsChainSpec} from '@/components/preview/blocks/FormControlsBlock.chain'
```

Add `chainSpec: formControlsChainSpec` to the `form-controls` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "FormControls"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/FormControlsBlock.tsx components/preview/blocks/FormControlsBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate FormControlsBlock to CSS vars + add chain spec"
```

---

## Task 3: ColorTokenInspectorBlock

**Files:**
- Modify: `components/preview/blocks/ColorTokenInspectorBlock.tsx`
- Create: `components/preview/blocks/ColorTokenInspectorBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.page`, `c.bs`, `c.tm`. Drop `c` entirely.

- [ ] **Step 1: Migrate ColorTokenInspectorBlock.tsx**

```tsx
'use client'

import {useMemo} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip.tsx'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'

export function ColorTokenInspectorBlock({tokenView, theme, inspection, onSelectSystem}: BlockCaseProps) {
  const surfaceTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'surface'), [tokenView])
  const borderTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'border'), [tokenView])
  const textTokens = useMemo(() => tokensForSemanticLayerPublic(tokenView, 'text'), [tokenView])

  const rows = [
    {label: 'Surface', tokens: surfaceTokens},
    {label: 'Border', tokens: borderTokens},
    {label: 'Text', tokens: textTokens},
  ]

  return (
    <TooltipProvider>
      <div className="space-y-12 rounded-lg border border-(--color-border-muted) bg-(--color-surface-default) p-12">
        {rows.map(({label, tokens}) => (
          <div key={label}>
            <p className="mb-6 text-micro font-medium uppercase tracking-wide text-(--color-text-muted)">{label}</p>
            <div className="flex flex-wrap gap-6">
              {tokens.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="h-28 w-28 rounded-full border-2 border-hairline-strong shadow-inner transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      style={{backgroundColor: t.serialized.hex}}
                      onClick={() => onSelectSystem?.(t.role, theme)}
                      aria-label={t.role}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-mono text-micro">{t.name}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
        {inspection ? null : (
          <p className="text-nano text-white/45">Click a swatch to inspect its token</p>
        )}
      </div>
    </TooltipProvider>
  )
}
ColorTokenInspectorBlock.displayName = 'ColorTokenInspectorBlock'
```

- [ ] **Step 2: Create ColorTokenInspectorBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'color-token-inspector',
  entries: [
    {
      element: 'Card background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Card edge',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Subtle border — the inspector is a reference panel, not an interactive control. A hairline boundary groups the content without framing it like a form field.',
    },
    {
      element: 'Group label',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Category headings (Surface / Border / Text) use text.muted — they are structural labels, not content.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as colorTokenInspectorChainSpec} from '@/components/preview/blocks/ColorTokenInspectorBlock.chain'
```

Add `chainSpec: colorTokenInspectorChainSpec` to the `color-token-inspector` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "ColorToken"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/ColorTokenInspectorBlock.tsx components/preview/blocks/ColorTokenInspectorBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate ColorTokenInspectorBlock to CSS vars + add chain spec"
```

---

## Task 4: FormFieldBlock

**Files:**
- Modify: `components/preview/blocks/FormFieldBlock.tsx`
- Create: `components/preview/blocks/FormFieldBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.ts`, `c.bStr`, `c.bd`, `c.tdis`. Drop `c` entirely.

- [ ] **Step 1: Migrate FormFieldBlock.tsx**

```tsx
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Input} from '@/components/ui/input.tsx'

export function FormFieldBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <div className="space-y-12">
      <label className="block space-y-4">
        <span className="text-micro font-medium text-(--color-text-subtle)">
          Company
        </span>
        <Input
          placeholder="Search accounts…"
          style={{borderColor: 'var(--color-border-emphasis)'}}
        />
        <span className="flex flex-wrap items-center gap-x-2 text-nano text-white/45">
          <span>placeholder</span>
          <SemanticTokenAnnotation role="text.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          <span>·</span>
          <span>field edge</span>
          <SemanticTokenAnnotation role="border.emphasis" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <label className="block space-y-4">
        <span className="text-micro font-medium text-(--color-text-subtle)">
          Read-only
        </span>
        <Input
          readOnly
          aria-readonly="true"
          className="cursor-default"
          style={{borderColor: 'var(--color-border-default)', color: 'var(--color-text-disabled)'}}
          defaultValue="INV-20418 · locked"
        />
        <span className="flex items-center gap-x-2 text-nano text-white/45">
          <span>locked text</span>
          <SemanticTokenAnnotation role="text.disabled" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <p className="flex flex-wrap items-center gap-x-2 text-micro leading-snug text-(--color-text-subtle)">
        <span>Use a shorter billing cycle to reduce variance.</span>
        <SemanticTokenAnnotation role="text.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </p>
    </div>
  )
}
FormFieldBlock.displayName = 'FormFieldBlock'
```

- [ ] **Step 2: Create FormFieldBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'form-field',
  entries: [
    {
      element: 'Field label',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Active field edge',
      dtcgPath: 'color.border.emphasis',
      cssVar: '--color-border-emphasis',
      usage: 'border-color',
      description: 'Strong weight — form fields that capture primary data use border.emphasis to signal editability. Heavier than layout dividers (border.muted) and distinct from border.default used on read-only fields.',
    },
    {
      element: 'Read-only field edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Default weight — read-only field still shows a boundary but recedes behind the active field, communicating that it is not interactive.',
    },
    {
      element: 'Locked text',
      dtcgPath: 'color.text.disabled',
      cssVar: '--color-text-disabled',
      usage: 'color',
      description: 'Disabled tier — read-only content uses text.disabled to signal it cannot be edited, not just that it is secondary.',
    },
    {
      element: 'Help text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Placeholder',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as formFieldChainSpec} from '@/components/preview/blocks/FormFieldBlock.chain'
```

Add `chainSpec: formFieldChainSpec` to the `form-field` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "FormField"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/FormFieldBlock.tsx components/preview/blocks/FormFieldBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate FormFieldBlock to CSS vars + add chain spec"
```

---

## Task 5: LayoutNavBlock

**Files:**
- Modify: `components/preview/blocks/LayoutNavBlock.tsx`
- Create: `components/preview/blocks/LayoutNavBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.page`, `c.sunken`, `c.subtle`, `c.bs`, `c.td`, `c.ts`, `c.tm`. Drop `c` entirely.

- [ ] **Step 1: Migrate LayoutNavBlock.tsx**

```tsx
'use client'

import {useState} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'

export function LayoutNavBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  const [activeNav, setActiveNav] = useState(0)
  return (
    <div className="space-y-8">
      <div
        className="flex min-h-176 overflow-hidden rounded-md border border-(--color-border-muted) bg-(--color-surface-default)"
      >
        <aside
          className="flex w-[32%] shrink-0 flex-col border-r bg-(--color-surface-sunken)"
          style={{
            borderColor: 'var(--color-border-muted)',
            boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.04), inset 2px 0 6px rgba(0,0,0,0.04)',
          }}
        >
          <p
            className="border-b px-8 py-6 text-nano font-medium uppercase tracking-wide text-(--color-text-muted)"
            style={{borderColor: 'var(--color-border-muted)'}}
          >
            Navigation
          </p>
          <nav className="flex flex-col gap-2 p-8">
            {['Overview', 'Reports', 'Settings'].map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(i)}
                className="rounded px-8 py-6 text-left text-xs transition-colors"
                style={{
                  backgroundColor: activeNav === i ? 'var(--color-surface-default)' : 'transparent',
                  color: activeNav === i ? 'var(--color-text-default)' : 'var(--color-text-subtle)',
                  fontWeight: activeNav === i ? 600 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="border-b px-12 py-8 text-xs text-(--color-text-default)"
            style={{borderColor: 'var(--color-border-muted)'}}
          >
            Main workspace
          </div>
          <div className="flex-1 p-8 sm:p-12">
            <div
              className="rounded-md border bg-(--color-surface-subtle) p-8 sm:p-12"
              style={{borderColor: 'var(--color-border-muted)'}}
            >
              <p className="text-xs font-medium text-(--color-text-default)">
                Panel
              </p>
              <p className="mt-4 text-micro leading-relaxed text-(--color-text-subtle)">
                Section dividers stay quiet so structure reads without heavy chrome.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>sidebar well</span>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>active row</span>
        <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>panel</span>
        <SemanticTokenAnnotation role="surface.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>dividers</span>
        <SemanticTokenAnnotation role="border.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
LayoutNavBlock.displayName = 'LayoutNavBlock'
```

- [ ] **Step 2: Create LayoutNavBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'layout-nav',
  entries: [
    {
      element: 'Page canvas',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Nav sidebar well',
      dtcgPath: 'color.surface.sunken',
      cssVar: '--color-surface-sunken',
      usage: 'background-color',
      description: 'Recessed below the main canvas — creates depth that visually pushes the nav behind content without a hard border or shadow.',
    },
    {
      element: 'Active nav row',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Active selection lifts to the default canvas level — the row "surfaces" out of the sunken well, making selection legible through depth alone.',
    },
    {
      element: 'Content panel',
      dtcgPath: 'color.surface.subtle',
      cssVar: '--color-surface-subtle',
      usage: 'background-color',
      description: 'Subtle elevation groups panel content above the canvas without the hard boundary of a card.',
    },
    {
      element: 'Dividers',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Subtle borders — structural dividers should read as layout guides, not interactive affordances.',
    },
    {
      element: 'Primary text',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Secondary text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Metadata labels',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as layoutNavChainSpec} from '@/components/preview/blocks/LayoutNavBlock.chain'
```

Add `chainSpec: layoutNavChainSpec` to the `layout-nav` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "LayoutNav"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/LayoutNavBlock.tsx components/preview/blocks/LayoutNavBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate LayoutNavBlock to CSS vars + add chain spec"
```

---

## Task 6: CalloutBlock

**Files:**
- Modify: `components/preview/blocks/CalloutBlock.tsx`
- Create: `components/preview/blocks/CalloutBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.inverse`, `c.bd`, `c.ton`, `c.brand`. `c.brand` stays as a runtime inline style via `NewBlockColors`. Import `CaseRenderProps` (keeps `c`).

- [ ] **Step 1: Migrate CalloutBlock.tsx**

```tsx
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function CalloutBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch">
        <div
          className="flex-1 rounded-md border bg-(--color-surface-inverse) px-12 py-10"
          style={{borderColor: 'var(--color-border-default)'}}
        >
          <p className="text-nano font-semibold uppercase tracking-wide text-(--color-text-on)">
            System
          </p>
          <p className="mt-4 text-xs leading-snug text-(--color-text-on)">
            Policy saved — your workspace will sync on next load.
          </p>
          <Button variant="ghost" size="xs" className="mt-8 text-(--color-text-on)">
            Dismiss
          </Button>
        </div>
        <div
          id="brand-callout"
          className="flex-1 rounded-md border px-12 py-10"
          style={{backgroundColor: c.brand, borderColor: 'var(--color-border-default)'}}
        >
          <p className="text-nano font-semibold uppercase tracking-wide text-(--color-text-on)">
            Brand
          </p>
          <p className="mt-4 text-xs leading-snug text-(--color-text-on)">
            Upgrade to Pro for audit trails and SSO.
          </p>
          <Button variant="ghost" size="xs" className="mt-8 text-(--color-text-on)">
            Learn more
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>inverse strip</span>
        <SemanticTokenAnnotation role="surface.inverse" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>brand strip</span>
        <SemanticTokenAnnotation role="surface.brand" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>+</span>
        <SemanticTokenAnnotation role="text.on" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
CalloutBlock.displayName = 'CalloutBlock'
```

- [ ] **Step 2: Create CalloutBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'callout',
  entries: [
    {
      element: 'Inverse strip',
      dtcgPath: 'color.surface.inverse',
      cssVar: '--color-surface-inverse',
      usage: 'background-color',
      description: 'Semantic ramp flip — the highest step of the neutral scale, creating maximum contrast against the default canvas. Used for system-critical messages that must stand out.',
    },
    {
      element: 'Brand strip',
      dtcgPath: 'color.surface.brand',
      cssVar: '--color-surface-brand',
      usage: 'background-color',
      description: 'Runtime brand oklch — cannot be a static CSS variable as it varies per workbench config. Shares the same text.on ink as the inverse strip, proving both planes belong to the same "on-color" tier.',
    },
    {
      element: 'Strip edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Strip text',
      dtcgPath: 'color.text.on',
      cssVar: '--color-text-on',
      usage: 'color',
      description: 'text.on is the only text role designed for dark/saturated surfaces — it maintains readability regardless of whether the plane is inverse or brand-colored.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as calloutChainSpec} from '@/components/preview/blocks/CalloutBlock.chain'
```

Add `chainSpec: calloutChainSpec` to the `callout` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "Callout"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/CalloutBlock.tsx components/preview/blocks/CalloutBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate CalloutBlock to CSS vars + add chain spec"
```

---

## Task 7: OverlayMenuBlock

**Files:**
- Modify: `components/preview/blocks/OverlayMenuBlock.tsx`
- Create: `components/preview/blocks/OverlayMenuBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.page`, `c.overlay`, `c.bs`, `c.bd`, `c.ts`, `c.td`, `c.scrimBg`. `c.scrimBg` stays as a runtime inline style. Import `CaseRenderProps` (keeps `c`).

- [ ] **Step 1: Migrate OverlayMenuBlock.tsx**

```tsx
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function OverlayMenuBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-8">
      <div
        className="relative min-h-[7rem] rounded-md border bg-(--color-surface-default) p-12"
        style={{borderColor: 'var(--color-border-muted)'}}
      >
        <p className="text-xs text-(--color-text-subtle)">
          Anchor region
        </p>
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{backgroundColor: c.scrimBg}}
          aria-hidden
        />
        <div
          className="absolute left-12 top-40 z-10 min-w-[11rem] rounded-md border bg-(--color-surface-overlay) py-4"
          style={{borderColor: 'var(--color-border-default)', boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}
        >
          <Button variant="ghost" size="sm" className="w-full justify-start text-(--color-text-default)">
            Duplicate
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-(--color-text-default)">
            Archive
          </Button>
          <div className="my-4 border-t" style={{borderColor: 'var(--color-border-muted)'}} />
          <Button variant="ghost" size="sm" className="w-full justify-start text-(--color-text-default)">
            Delete…
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>menu plane</span>
        <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>item label</span>
        <SemanticTokenAnnotation role="text.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>scrim</span>
        <SemanticTokenAnnotation role="overlay.scrim" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
OverlayMenuBlock.displayName = 'OverlayMenuBlock'
```

- [ ] **Step 2: Create OverlayMenuBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'overlay-menu',
  entries: [
    {
      element: 'Anchor background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Menu plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Highest elevation plane — ephemeral UI (menus, popovers, dialogs) always sits on surface.overlay so it is visually above every persistent surface.',
    },
    {
      element: 'Menu edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Divider',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Subtle weight separates destructive actions within the menu without creating the visual weight of a section header.',
    },
    {
      element: 'Menu item text',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Anchor text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Scrim',
      dtcgPath: 'color.overlay.scrim',
      cssVar: '--color-overlay-scrim',
      usage: 'background-color',
      description: 'Runtime alpha-mixed value — the scrim opacity is configurable per workbench session, so it cannot be a static CSS variable. Dims the anchor region to focus attention on the menu.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as overlayMenuChainSpec} from '@/components/preview/blocks/OverlayMenuBlock.chain'
```

Add `chainSpec: overlayMenuChainSpec` to the `overlay-menu` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "OverlayMenu"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/OverlayMenuBlock.tsx components/preview/blocks/OverlayMenuBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate OverlayMenuBlock to CSS vars + add chain spec"
```

---

## Task 8: SurfaceHierarchyBlock

**Files:**
- Modify: `components/preview/blocks/SurfaceHierarchyBlock.tsx`
- Create: `components/preview/blocks/SurfaceHierarchyBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Uses `c.sunken`, `c.page`, `c.raised`, `c.overlay`, `c.bs`, `c.bd`, `c.tm`, `c.ts`, `c.td`. Drop `c` entirely.

- [ ] **Step 1: Migrate SurfaceHierarchyBlock.tsx**

```tsx
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'

export function SurfaceHierarchyBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <div
      className="rounded-lg border bg-(--color-surface-sunken) p-12 sm:p-16"
      style={{borderColor: 'var(--color-border-muted)'}}
    >
      <div className="flex items-center gap-6">
        <p className="text-micro font-semibold uppercase tracking-wide text-(--color-text-muted)">Sunken</p>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
      <div
        className="mt-8 rounded-md border bg-(--color-surface-default) p-10"
        style={{borderColor: 'var(--color-border-muted)'}}
      >
        <div className="flex items-center gap-6">
          <p className="text-micro font-semibold uppercase tracking-wide text-(--color-text-subtle)">Default</p>
          <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </div>
        <div
          className="mt-8 rounded-md border bg-(--color-surface-raised) p-10 shadow-raised"
          style={{borderColor: 'var(--color-border-default)'}}
        >
          <div className="flex items-center gap-6">
            <p className="text-micro font-semibold uppercase tracking-wide text-(--color-text-subtle)">Raised</p>
            <SemanticTokenAnnotation role="surface.raised" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          </div>
          <div
            className="mt-8 rounded-md border bg-(--color-surface-overlay) p-10 shadow-overlay"
            style={{borderColor: 'var(--color-border-default)'}}
          >
            <div className="flex items-center gap-6">
              <p className="text-micro font-semibold uppercase tracking-wide text-(--color-text-default)">Overlay</p>
              <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
            </div>
            <p className="mt-4 text-micro leading-relaxed text-(--color-text-subtle)">
              Highest elevation — menus, popovers, dialogs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
SurfaceHierarchyBlock.displayName = 'SurfaceHierarchyBlock'
```

- [ ] **Step 2: Create SurfaceHierarchyBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'surface-hierarchy',
  entries: [
    {
      element: 'Sunken plane',
      dtcgPath: 'color.surface.sunken',
      cssVar: '--color-surface-sunken',
      usage: 'background-color',
      description: 'Lowest elevation — recessed below the default canvas. Used for wells, sidebars, and inset areas that should feel behind content.',
    },
    {
      element: 'Default plane',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Baseline canvas — the neutral reference point all other elevations are measured against.',
    },
    {
      element: 'Raised plane',
      dtcgPath: 'color.surface.raised',
      cssVar: '--color-surface-raised',
      usage: 'background-color',
      description: 'One step above default — cards, panels, and tiles that need visual lift without full overlay weight.',
    },
    {
      element: 'Overlay plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Highest persistent elevation — ephemeral UI (menus, dialogs, popovers) always sits here so it reads above every other surface.',
    },
    {
      element: 'Shallow borders',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Subtle weight on sunken and default planes — structural boundaries that define shape without competing with the elevation story.',
    },
    {
      element: 'Lifted borders',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Default weight on raised and overlay planes — heavier borders reinforce the elevation step.',
    },
    {
      element: 'Sunken label',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
    },
    {
      element: 'Mid-level label',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Overlay label',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
      description: 'Highest-contrast text on the highest-elevation plane — text.default at the overlay level ensures legibility at peak elevation.',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as surfaceHierarchyChainSpec} from '@/components/preview/blocks/SurfaceHierarchyBlock.chain'
```

Add `chainSpec: surfaceHierarchyChainSpec` to the `surface-hierarchy` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "SurfaceHierarchy"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/SurfaceHierarchyBlock.tsx components/preview/blocks/SurfaceHierarchyBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate SurfaceHierarchyBlock to CSS vars + add chain spec"
```

---

## Task 9: FeedbackBlock

**Files:**
- Modify: `components/preview/blocks/FeedbackBlock.tsx`
- Create: `components/preview/blocks/FeedbackBlock.chain.ts`
- Modify: `components/preview/previewBlockRegistry.tsx`

Most complex block — uses 11 `c.*` fields. `c.brand` stays as runtime inline style. Import `CaseRenderProps` (keeps `c`).

- [ ] **Step 1: Migrate FeedbackBlock.tsx**

```tsx
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Badge} from '@/components/ui/badge.tsx'
import {Button} from '@/components/ui/button.tsx'
import {Skeleton} from '@/components/ui/skeleton.tsx'

export function FeedbackBlock({c}: CaseRenderProps) {
  return (
    <div className="space-y-16 rounded-md bg-(--color-surface-default) p-12">
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-(--color-text-muted)">Loading</p>
        <div className="space-y-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-4/5" />
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-(--color-text-muted)">Toast</p>
        <div
          className="flex items-start justify-between gap-12 rounded-md border bg-(--color-surface-overlay) px-12 py-10 shadow-overlay"
          style={{borderColor: 'var(--color-border-default)'}}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-(--color-text-default)">Export complete</p>
            <p className="mt-2 text-micro text-(--color-text-subtle)">Your CSV is ready to download.</p>
          </div>
          <Button variant="ghost" size="icon-sm" className="shrink-0 text-lg leading-none text-(--color-text-muted)">
            ×
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-(--color-text-muted)">Badges</p>
        <div className="flex flex-wrap gap-6">
          <Badge variant="default" className="bg-(--color-surface-raised) border-(--color-border-default) text-(--color-text-default)">Default</Badge>
          <Badge variant="subtle" className="bg-(--color-surface-subtle) border-(--color-border-muted) text-(--color-text-subtle)">Subtle</Badge>
          <Badge variant="solid" className="bg-(--color-surface-inverse) text-(--color-text-on)">Inverse</Badge>
          <Badge variant="brand" style={{backgroundColor: c.brand}} className="text-(--color-text-on)">Brand</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
          <Badge variant="disabled" style={{opacity: 0.5}}>Disabled</Badge>
        </div>
      </div>
    </div>
  )
}
FeedbackBlock.displayName = 'FeedbackBlock'
```

- [ ] **Step 2: Create FeedbackBlock.chain.ts**

```ts
import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'feedback',
  entries: [
    {
      element: 'Page background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Toast plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Toasts float above page content — overlay elevation ensures they read above cards, panels, and other persistent surfaces.',
    },
    {
      element: 'Toast edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Default badge surface',
      dtcgPath: 'color.surface.raised',
      cssVar: '--color-surface-raised',
      usage: 'background-color',
      description: 'Raised — badges need slight lift above the canvas to be legible as distinct objects, not text spans.',
    },
    {
      element: 'Default badge edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Subtle badge surface',
      dtcgPath: 'color.surface.subtle',
      cssVar: '--color-surface-subtle',
      usage: 'background-color',
    },
    {
      element: 'Subtle badge edge',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
    },
    {
      element: 'Inverse badge surface',
      dtcgPath: 'color.surface.inverse',
      cssVar: '--color-surface-inverse',
      usage: 'background-color',
      description: 'Semantic ramp flip — highest neutral step, maximum contrast against the canvas.',
    },
    {
      element: 'Brand badge surface',
      dtcgPath: 'color.surface.brand',
      cssVar: '--color-surface-brand',
      usage: 'background-color',
      description: 'Runtime brand oklch — cannot be a static CSS variable. Demonstrates that text.on works on both inverse and brand surfaces.',
    },
    {
      element: 'On-surface text',
      dtcgPath: 'color.text.on',
      cssVar: '--color-text-on',
      usage: 'color',
      description: 'Used on both inverse and brand badge — text.on is the single ink role designed for dark/saturated planes regardless of hue.',
    },
    {
      element: 'Primary text',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
    {
      element: 'Secondary text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Section labels',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
    },
  ],
}
```

- [ ] **Step 3: Register chainSpec in previewBlockRegistry.tsx**

Add import:
```ts
import {chainSpec as feedbackChainSpec} from '@/components/preview/blocks/FeedbackBlock.chain'
```

Add `chainSpec: feedbackChainSpec` to the `feedback` entry.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check 2>&1 | grep "Feedback"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/preview/blocks/FeedbackBlock.tsx components/preview/blocks/FeedbackBlock.chain.ts components/preview/previewBlockRegistry.tsx
git commit -m "feat(preview): migrate FeedbackBlock to CSS vars + add chain spec"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full type-check**

```bash
pnpm type-check
```

Expected: zero errors. Any remaining errors mean a `c.*` field was missed — grep for the field name in the flagged file and replace it.

- [ ] **Step 2: Run tests**

```bash
pnpm test
```

Expected: all 60 tests pass (engine tests — no block-level tests exist).

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: static generation completes with no errors.

- [ ] **Step 4: Manual verification**

Start dev server:
```bash
pnpm dev
```

Check:
- All 10 blocks render correctly in both light and dark preview themes
- The **Token chain** button is now enabled (not greyed out) on all 10 blocks
- Clicking each block's **Token chain** button opens the drawer with the correct entries
- Changing the workbench scale updates swatch colors in the open drawer in real time
- No `style={{backgroundColor: '#...', color: '#...', borderColor: '#...'}}` remains in any block (only `brand` and `scrimBg` inline styles are acceptable)

- [ ] **Step 5: Grep to confirm no hex inline styles remain**

```bash
grep -rn "style={{" components/preview/blocks/ | grep -v "brand\|scrimBg\|opacity\|boxShadow\|borderColor.*var\|backgroundColor.*var\|color.*var\|fontWeight\|minHeight\|backgroundColor.*c\."
```

Expected: only lines using CSS var syntax (`var(--color-*)`), `c.brand`, `c.scrimBg`, `opacity`, `boxShadow`, or `fontWeight` — no raw hex values.
