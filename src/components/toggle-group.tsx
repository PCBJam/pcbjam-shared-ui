import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { toggleVariants } from "./toggle";

type ToggleVariants = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = React.createContext<ToggleVariants>({ variant: "default", size: "default" });

type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  ToggleVariants & {
    /**
     * type="single" only: let a click on the chosen item clear the choice (value ""). Off by
     * default, because a filter or a view switch always needs one item chosen.
     */
    deselectable?: boolean;
  };

/**
 * shadcn/ui's ToggleGroup: buttons where one (type="single", items are radios) or several
 * (type="multiple", items are pressed toggles) can be on. `variant="segmented"` draws the
 * items on a muted track, the chosen one raised.
 */
const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(
  ({ className, variant, size, deselectable, children, ...props }, ref) => {
    const rootProps =
      props.type === "single" && !deselectable
        ? { ...props, onValueChange: (v: string) => v && props.onValueChange?.(v) }
        : props;
    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn(
          "flex items-center gap-1",
          variant === "segmented" && "inline-flex w-fit rounded-lg bg-muted p-1",
          className,
        )}
        {...rootProps}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    );
  },
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & ToggleVariants
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({ variant: context.variant || variant, size: context.size || size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
