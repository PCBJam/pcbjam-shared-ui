import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        outline:
          "border border-input bg-transparent text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground",
        // An item on a ToggleGroup's track: the chosen one sits raised on the card colour.
        segmented:
          "text-muted-foreground hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        // No pressed look of its own, only a hover fill: for a toggle whose label or icon says its
        // state ("Show pins" / "Hide pins"), or one the caller styles with data-[state=on]:.
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-9 min-w-9 px-3 [&_svg]:size-4",
        sm: "h-8 min-w-8 px-2.5 text-xs [&_svg]:size-4",
        // A full-width menu row: icon, label, then anything pushed right with ml-auto.
        row: "w-full justify-start gap-2 whitespace-normal px-2 py-1.5 text-left text-xs font-normal",
        // A bare icon in a dense header or list row; the icon sets the size.
        xs: "rounded p-0.5",
      },
    },
    compoundVariants: [
      { variant: "segmented", size: "default", class: "h-7 px-3" },
      { variant: "segmented", size: "sm", class: "h-6 px-2" },
    ],
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** A two-state button (`aria-pressed`), for one switch such as "show comments". */
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size }), className)} {...props} />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
