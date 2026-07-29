import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
           // @replit: no hover, and add primary border
           "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          " border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          "border bg-secondary text-secondary-foreground border border-secondary-border ",
        // @replit no hover, transparent border
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        // Identity/recognition action (gold) — the on-brand CTA color. Semantic
        // tokens only (--identity + its paired foreground); hover-elevate from base.
        identity: "bg-identity text-identity-foreground border border-transparent",
      },
      size: {
        // @replit changed sizes
        //
        // THE 44px TOUCH FLOOR, applied where it is a floor and nowhere else
        // (2026-07-27, the founder's §(b)② finding "every button on the /join
        // path is under 44px on a phone" — measured on /join at 375px: 49 visible
        // controls, 13 short, and SEVEN of those were this atom at 38px).
        //
        // The floor is a TOUCH rule — Apple HIG 44 / Material 48 are finger
        // guidelines, and WCAG 2.5.5 (44×44) is level AAA, while the AA
        // requirement, 2.5.8, is 24×24. So it applies to the coarse pointer
        // only: a finger gets 44px, a mouse keeps the density the founder
        // already approved on desktop. Raising the base instead would have made
        // every button on every page 6px taller — a composition change nobody
        // asked for, to satisfy a rule that was never about the mouse.
        //
        // ⛔ CORRECTED 2026-07-29. This comment used to say Tailwind's
        // coarse-pointer variant "is a ghost here" and produced no CSS. THAT WAS
        // A MEASUREMENT ERROR, and three independent adjudicators disproved it
        // against the project's own `vite build`: the variant compiles normally
        // and its rule ships. Two compounding traps made the false negative look
        // proven — Tailwind CSS-ESCAPES the colon in the emitted selector, so a
        // search for the class as AUTHORED never matches the CSS as EMITTED; and
        // the DEV SERVER nests the rule inside its class rule instead of hoisting
        // a top-level media rule, so a CSSOM walk over top-level rules counts
        // none. The dev server is not what ships.
        //
        // `.touch-target` is KEPT, on the correct reason rather than the old one:
        // a NAMED class in index.css lets guard-touch-target PARSE the 44px out
        // of the CSS that actually ships, instead of trusting a class string it
        // can only assume compiles — and deleting the block turns the build RED.
        // One 44px number, in one place (rule ④).
        default: "min-h-9 touch-target px-4 py-2",
        sm: "min-h-8 touch-target rounded-md px-3 text-xs",
        lg: "min-h-10 touch-target rounded-md px-8",
        icon: "h-9 w-9 touch-target-square",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
