import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Manual mapping for design system
    let variantClasses = "bg-primary text-ink-inverse hover:bg-primary-hover shadow-sm"
    if (variant === "secondary") variantClasses = "bg-transparent text-primary border border-primary hover:bg-primary-subtle shadow-sm"
    if (variant === "outline") variantClasses = "bg-transparent text-ink border border-border hover:bg-gray-100 shadow-sm"
    if (variant === "ghost") variantClasses = "bg-transparent text-ink-secondary hover:bg-gray-100"
    if (variant === "destructive") variantClasses = "bg-danger text-ink-inverse hover:bg-danger-hover shadow-sm"
    if (variant === "success") variantClasses = "bg-success text-ink-inverse hover:bg-success-hover shadow-sm"

    let sizeClasses = "h-[40px] px-[16px] text-button"
    if (size === "sm") sizeClasses = "h-[32px] px-[12px] text-button-sm"
    if (size === "lg") sizeClasses = "h-[48px] px-[24px] text-body-lg"

    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text ${variantClasses} ${sizeClasses} ${className || ""}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
