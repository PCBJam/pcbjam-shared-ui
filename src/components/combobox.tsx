import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Options with the same group are listed under that heading, in first-seen order. */
  group?: string;
  /** Extra words the search matches besides the label. */
  keywords?: string[];
  /** Quiet text at the end of the row. */
  hint?: React.ReactNode;
  disabled?: boolean;
};

export type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  className?: string;
  /** Classes for the floating list, e.g. a higher z-index over an editor panel. */
  contentClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "data-testid"?: string;
};

// cmdk needs a non-empty value per item; "" is a valid option value for callers.
const EMPTY = "__pcbjam-ui-empty__";

/**
 * A select with a search box, for lists that can get long (branches, repositories,
 * accounts). shadcn/ui's combobox pattern: a Popover holding a Command list.
 */
const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Choose…",
      searchPlaceholder = "Search…",
      emptyText = "Nothing found.",
      id,
      className,
      contentClassName,
      disabled,
      "aria-label": ariaLabel,
      "data-testid": testId,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o) => o.value === value);
    const groups = React.useMemo(() => {
      const map = new Map<string | undefined, ComboboxOption[]>();
      for (const o of options) map.set(o.group, [...(map.get(o.group) ?? []), o]);
      return [...map.entries()];
    }, [options]);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            id={id}
            disabled={disabled}
            data-testid={testId}
            // The chosen value, for tests (a button has no `value` to read).
            data-value={value}
            data-placeholder={selected ? undefined : ""}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("w-[--radix-popover-trigger-width] min-w-[12rem] p-0", contentClassName)}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {groups.map(([group, items]) => (
                <CommandGroup key={group ?? ""} heading={group}>
                  {items.map((o) => (
                    <CommandItem
                      key={o.value}
                      value={o.value === "" ? EMPTY : o.value}
                      keywords={[o.label, ...(o.keywords ?? [])]}
                      disabled={o.disabled}
                      // The caller's value, for tests: `[role=option][data-option-value="…"]`.
                      data-option-value={o.value}
                      onSelect={() => {
                        onValueChange(o.value);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn(o.value === value ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{o.label}</span>
                      {o.hint != null && <span className="ml-auto pl-2 text-xs text-muted-foreground">{o.hint}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
