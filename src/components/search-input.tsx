import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export interface SearchInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** default is 36px with 14px text; sm is 32px with 12px text. */
  size?: "default" | "sm";
  /** Shows a clear button while the field has text. */
  onClear?: () => void;
  /** The clear button's name (default "Clear the search"). */
  clearLabel?: string;
  /** Classes for the input itself; `className` lays out the field. */
  inputClassName?: string;
}

/**
 * A search or filter field: an Input with a search icon in front and, given `onClear`, a clear
 * button at the end. Other props (value, onChange, placeholder, aria-label, data-testid…) go to
 * the input.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ size = "default", onClear, clearLabel = "Clear the search", className, inputClassName, ...props }, ref) => {
    const sm = size === "sm";
    const hasText = props.value != null && String(props.value) !== "";
    return (
      <div className={cn("relative", className)}>
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            sm ? "left-2.5 size-3.5" : "left-3 size-4",
          )}
        />
        <Input
          ref={ref}
          className={cn(sm ? "h-8 pl-8 text-xs" : "pl-9", onClear && "pr-8", inputClassName)}
          {...props}
        />
        {onClear && hasText && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={clearLabel}
            onClick={onClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
