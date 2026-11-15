import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden rounded-md border px-2 py-1 font-mono text-[11px] leading-none font-normal whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "border-input text-muted-foreground",
        nominal: "border-input text-muted-foreground",
        caution: "border-caution/50 bg-caution-soft text-caution",
        critical: "border-foreground bg-foreground font-medium text-background",
        tag: "border-input text-[11px] text-ink-3",
        "tag-signal": "border-input bg-panel-2 text-[11px] text-ink-2",
        "tag-caution": "border-input bg-panel-2 text-[11px] text-ink-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
