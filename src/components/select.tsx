import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/utils";

// Radix reserves "" for "nothing chosen" and refuses <Select.Item value="">, while a native
// <select> commonly uses "" for its "All" or "None" option. An item with value "" is kept
// under this private value instead, and Select maps it back, so callers keep using "".
const EMPTY = "__pcbjam-ui-empty__";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

type SelectState = {
  /** The controlled value as the caller sees it, for the trigger's `data-value`. */
  value: string | undefined;
  /** An item with value "" mounted; returns its unmount. */
  registerEmpty: () => () => void;
};

const SelectStateContext = React.createContext<SelectState | null>(null);

/**
 * shadcn/ui's Select. An item may use `value=""`: with a controlled `value` of "", that item
 * is shown as chosen; without such an item, "" shows the placeholder, as in Radix.
 *
 * In a form, Radix adds a hidden native <select> that sees the private stand-in for "", so
 * `required` would count an empty item as filled and `name` would post the stand-in. For a
 * form field, use a placeholder instead of an empty item.
 */
function Select({ value, defaultValue, onValueChange, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) {
  const [emptyItems, setEmptyItems] = React.useState(0);
  const registerEmpty = React.useCallback(() => {
    setEmptyItems((n) => n + 1);
    return () => setEmptyItems((n) => n - 1);
  }, []);
  const toRadix = (v: string | undefined) => (v === "" && emptyItems > 0 ? EMPTY : v);
  const state = React.useMemo(() => ({ value, registerEmpty }), [value, registerEmpty]);
  return (
    <SelectStateContext.Provider value={state}>
      <SelectPrimitive.Root
        value={toRadix(value)}
        defaultValue={toRadix(defaultValue)}
        onValueChange={(v) => {
          // A raw "" is never a choice here (empty items arrive as EMPTY). Radix sends it when
          // the hidden form <select> is set to a value whose option has not mounted yet, e.g. a
          // value and its options changing in one render; passing it on would wipe the value.
          if (v === "") return;
          onValueChange?.(v === EMPTY ? "" : v);
        }}
        {...props}
      />
    </SelectStateContext.Provider>
  );
}

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const state = React.useContext(SelectStateContext);
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      // The chosen value, for tests and styling (a button has no `value` to read).
      data-value={state?.value}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1 [&>span]:text-left",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border bg-card text-card-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, value, ...props }, ref) => {
  const state = React.useContext(SelectStateContext);
  const isEmpty = value === "";
  const registerEmpty = state?.registerEmpty;
  // Items mount while the select is closed too (Radix renders them off-screen to fill in the
  // trigger's text), so the root knows about an empty item before the first paint.
  useIsomorphicLayoutEffect(() => (isEmpty && registerEmpty ? registerEmpty() : undefined), [isEmpty, registerEmpty]);
  return (
    <SelectPrimitive.Item
      ref={ref}
      value={isEmpty ? EMPTY : value}
      // The caller's value, for tests: `[role=option][data-option-value="…"]`.
      data-option-value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
