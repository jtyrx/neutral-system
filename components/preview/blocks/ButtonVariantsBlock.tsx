import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
  PreviewSpecimen,
  PreviewSpecimenRow,
  previewSectionRule,
} from '@/components/preview/blocks/previewSpecimen'
import {Button} from '@/components/ui/button.tsx'
import {ButtonGroup, ButtonGroupSeparator} from '@/components/ui/button-group.tsx'
import {cn} from '@/lib/cn'
import {Loader2} from 'lucide-react'
import {Fragment, type ComponentProps} from 'react'

const BUTTON_VARIANTS = [
  {value: 'default' as const, label: 'Default'},
  {value: 'secondary' as const, label: 'Secondary'},
  {value: 'outline' as const, label: 'Outline'},
  {value: 'ghost' as const, label: 'Ghost'},
  {value: 'destructive' as const, label: 'Destructive'},
  {value: 'link' as const, label: 'Link'},
] as const

const BUTTON_SIZES = [
  {value: 'xs' as const, label: 'XS'},
  {value: 'sm' as const, label: 'SM'},
  {value: 'md' as const, label: 'MD'},
  {value: 'lg' as const, label: 'LG'},
] as const

const STATE_COLUMNS = [
  {id: 'rest' as const, label: 'Rest'},
  {id: 'disabled' as const, label: 'Disabled'},
  {id: 'loading' as const, label: 'Loading'},
] as const

type Variant = (typeof BUTTON_VARIANTS)[number]['value']
type Size = (typeof BUTTON_SIZES)[number]['value']
type MatrixState = (typeof STATE_COLUMNS)[number]['id']

const STICKY_CELL = cn(
  'sticky z-[1] bg-default',
  'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-hairline',
)

const STICKY_VARIANT = cn(
  STICKY_CELL,
  'left-0 min-w-[4.5rem] pr-4 text-left font-mono text-nano text-muted',
)

const STICKY_SIZE = cn(
  STICKY_CELL,
  'left-[4.5rem] min-w-[2.5rem] pr-4 text-center font-mono text-nano tabular-nums text-disabled',
)

function matrixButtonCopy(variant: Variant, variantLabel: string): string {
  if (variant === 'link') return 'Learn more'
  if (variant === 'destructive') return 'Delete'
  return variantLabel
}

function matrixStateLabel(state: MatrixState): string {
  if (state === 'rest') return 'resting'
  if (state === 'disabled') return 'disabled'
  return 'loading'
}

function MatrixButton({
  variant,
  size,
  variantLabel,
  state,
}: {
  variant: Variant
  size: Size
  variantLabel: string
  state: MatrixState
}) {
  const copy = matrixButtonCopy(variant, variantLabel)
  const stateLabel = matrixStateLabel(state)
  const shared: ComponentProps<typeof Button> = {
    variant,
    size,
    tabIndex: -1,
    'aria-label': `${variantLabel}, ${size}, ${stateLabel}`,
  }

  if (state === 'loading') {
    return (
      <Button {...shared} disabled aria-busy="true">
        <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
        <span className={cn((size === 'xs' || size === 'sm') && 'sr-only')}>{copy}</span>
      </Button>
    )
  }

  return (
    <Button {...shared} disabled={state === 'disabled'}>
      {copy}
    </Button>
  )
}

export function ButtonVariantsBlock({
  theme,
  inspection,
  onSelectSystem,
}: BlockCaseProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'canvas', role: 'surface.default'},
        {prefix: 'primary fill', role: 'surface.inverse'},
        {prefix: 'brand fill', role: 'surface.brand'},
        {prefix: 'focus ring', role: 'border.focus'},
        {prefix: 'label ink', role: 'text.on'},
      ]}
    >
      <PreviewBlockCanvas tone="flush" className="overflow-x-auto">
        <div className="min-w-[40rem] space-y-10 p-10 sm:p-12">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Button variants across sizes and interaction states. Matrix cells are visual
              specimens; use the Focus ring row below to tab through focus styles.
            </caption>
            <thead>
              <tr className="border-b border-hairline">
                <th scope="col" className={cn(STICKY_VARIANT, 'pb-8 font-normal')}>
                  <span className="sr-only">Variant</span>
                </th>
                <th
                  scope="col"
                  className={cn(STICKY_SIZE, 'pb-8 font-normal uppercase tracking-[0.1em]')}
                >
                  Size
                </th>
                {STATE_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className="pb-8 text-center font-mono text-nano font-normal uppercase tracking-[0.1em] text-muted"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUTTON_VARIANTS.map(({value, label}) => (
                <Fragment key={value}>
                  {BUTTON_SIZES.map(({value: size, label: sizeLabel}, sizeIndex) => (
                    <tr
                      key={`${value}-${size}`}
                      className="border-b border-hairline last:border-b-0"
                    >
                      {sizeIndex === 0 ? (
                        <th
                          scope="rowgroup"
                          rowSpan={BUTTON_SIZES.length}
                          className={cn(STICKY_VARIANT, 'align-top pt-3 font-normal')}
                        >
                          {label}
                        </th>
                      ) : null}
                      <th scope="row" className={cn(STICKY_SIZE, 'py-3 font-normal')}>
                        {sizeLabel}
                      </th>
                      {STATE_COLUMNS.map((col) => (
                        <td key={col.id} className="py-3">
                          <div className="flex justify-center">
                            <MatrixButton
                              variant={value}
                              size={size}
                              variantLabel={label}
                              state={col.id}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          <PreviewSpecimen label="Focus ring" className={previewSectionRule}>
            <p className="sr-only">
              Tab through each variant to inspect native focus-visible rings on the button
              component.
            </p>
            <div role="group" aria-label="Focus ring by variant">
              <PreviewSpecimenRow>
                {BUTTON_VARIANTS.map(({value, label}) => (
                  <Button key={value} variant={value} size="md">
                    {label}
                  </Button>
                ))}
              </PreviewSpecimenRow>
            </div>
          </PreviewSpecimen>

          <PreviewSpecimen label="Button group" className={previewSectionRule}>
            <ButtonGroup>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <ButtonGroupSeparator />
              <Button variant="default" size="sm">
                Save
              </Button>
              <Button variant="default" size="sm">
                Publish
              </Button>
            </ButtonGroup>
          </PreviewSpecimen>
        </div>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
ButtonVariantsBlock.displayName = 'ButtonVariantsBlock'
