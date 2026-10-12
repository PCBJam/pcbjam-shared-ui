import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  // The type and icon size live in the boxed sizes, so size="text" can take the surrounding font.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
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
        default: "h-9 px-4 py-2 text-sm font-medium [&_svg]:size-4",
        sm: "h-8 rounded-md px-3 text-xs font-medium [&_svg]:size-4",
        lg: "h-10 rounded-md px-8 text-sm font-medium [&_svg]:size-4",
        icon: "h-9 w-9 text-sm font-medium [&_svg]:size-4",
        // No box: the button is its text, in the surrounding font, and wraps like it.
        text: "h-auto gap-1 whitespace-normal p-0",
        // A full-width list row, laid out left to right in the surrounding font; the list sets
        // its padding, and a rounded row adds its radius.
        row: "flex h-auto w-full justify-start whitespace-normal rounded-none text-left",
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
