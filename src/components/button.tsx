import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  // The type and icon size live in the boxed sizes, so size="text" can take the surrounding font.
  // `touch:` (see tailwind-preset.js) gives the boxed sizes a 40px minimum target at phone width
  // on surfaces that opt in.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Dark: a switched-off primary is a light fill at half strength, which reads louder than
        // the enabled outline button next to it; it drops to the quiet secondary fill instead.
        // That fill is close to a dark card's own, so the button keeps an outline (an inset ring,
        // which does not change its size) and its label stays at full strength in the muted colour:
        // still plainly a button, plainly off.
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 dark:disabled:bg-secondary dark:disabled:text-muted-foreground dark:disabled:opacity-100 dark:disabled:ring-1 dark:disabled:ring-inset dark:disabled:ring-input",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-card hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // A text action on its own ("Or use SSH instead"): the surrounding colour, underlined
        // on hover. Goes with size="text".
        link: "underline-offset-2 hover:underline",
        // An action inside a sentence ("… or let PCBJam generate one"): always underlined, so it
        // stands out from the words around it without a colour of its own. Goes with size="text".
        inline: "underline underline-offset-2",
        // No colour, fill or underline of its own: a region whose content is the affordance (a
        // disclosure header, a tree row's name), or a control whose surface styles it (the
        // editor's overlays). Prefer a variant above when one fits.
        plain: "",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm font-medium touch:min-h-10 [&_svg]:size-4",
        sm: "h-8 rounded-md px-3 text-xs font-medium touch:min-h-10 touch:min-w-10 touch:text-sm [&_svg]:size-4",
        xs: "h-7 rounded-md px-2 text-xs font-medium touch:min-h-10 touch:min-w-10 touch:px-3 [&_svg]:size-3.5",
        lg: "h-10 rounded-md px-8 text-sm font-medium [&_svg]:size-4",
        icon: "h-9 w-9 text-sm font-medium touch:min-h-10 touch:min-w-10 [&_svg]:size-4",
        // A bare icon in a dense header or row (close, collapse); the icon sets the size.
        "icon-xs": "rounded p-0.5",
        // No box: the button is its text, in the surrounding font, and wraps like it.
        text: "h-auto gap-1 whitespace-normal p-0",
        // A full-width list row, laid out left to right in the surrounding font; the list sets
        // its padding, and a rounded row adds its radius.
        row: "flex h-auto w-full justify-start whitespace-normal rounded-none text-left focus-visible:ring-inset focus-visible:ring-offset-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
