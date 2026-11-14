import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Restyled to A.U.R.A. chips: 4px corners, mono, tight. Severity and provenance variants added.
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden rounded-sm border px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "border-input text-muted-foreground",
        // severity: colour never encodes critical (red means injury); critical is inverted ink
        nominal: "border-input text-muted-foreground",
        caution: "border-caution/50 bg-caution-soft text-caution",
        critical: "border-foreground bg-foreground font-semibold text-background",
        // provenance tags: uppercase marks where data comes from
        tag: "border-input text-[10px] tracking-[0.04em] text-ink-2 uppercase",
        "tag-signal": "border-signal-text/40 bg-signal-soft text-[10px] tracking-[0.04em] text-signal-text uppercase",
        "tag-caution": "border-caution/40 bg-caution-soft text-[10px] tracking-[0.04em] text-caution uppercase",
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
