import * as React from "react"

import { cn } from "@/lib/utils"

const inputDefaultClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

/** Matches `@utility ns-input` in app/globals.css — workbench field chrome. */
export const INPUT_WORKBENCH_FIELD_CLASS = "ns-input"

/**
 * Ghost number display: no background, border reveals on hover/focus.
 * Used for inline value readouts beside sliders.
 */
const inputGhostClassName =
  "rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-right font-mono text-xs text-muted tabular-nums transition hover:border-hairline focus:border-hairline focus:text-default focus:outline-none disabled:opacity-40"

export type InputProps = React.ComponentProps<"input"> & {
  variant?: "default" | "workbench" | "ghost"
}

function Input({
  className,
  type,
  variant = "default",
  ...props
}: InputProps) {
  const baseClass =
    variant === "workbench"
      ? INPUT_WORKBENCH_FIELD_CLASS
      : variant === "ghost"
        ? inputGhostClassName
        : inputDefaultClassName

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(baseClass, className)}
      {...props}
    />
  )
}

export { Input }
