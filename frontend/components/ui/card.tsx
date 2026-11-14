import * as React from "react"
import { cn } from "cn"

function Card({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-(--shadow)",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="card-header"
      className={cn(
        "flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-5 py-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("font-heading text-[14px] font-medium text-card-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-[12px] text-muted-foreground", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("flex items-center gap-2", className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("min-h-0 flex-1 overflow-auto p-5", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center border-t border-border px-4 py-2", className)} {...props} />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
