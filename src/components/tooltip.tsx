import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Above everything: the editor's own overlays reach z-[80], and a tooltip on one of
        // their buttons must not open behind the panel it belongs to.
        // pre-line and break-words: a title's "\n" still breaks the line, and a long path wraps.
        "z-[1000] max-w-72 overflow-hidden whitespace-pre-line break-words rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type TipProps = Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>, "content"> & {
  /** The tooltip text; nothing (or "") renders the child with no tooltip. */
  content: React.ReactNode;
  side?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["side"];
  align?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["align"];
  children: React.ReactElement;
};

// Radix's tooltip trigger puts its own data-state (closed, delayed-open) on the child, over the
// child's: a tab, toggle or switch inside a Tip would lose "active" or "on", and the styles
// that read it. This drops the tooltip's and passes on one that came from a parent trigger
// (a menu's open or closed).
//
// It also gives a disabled trigger its pointer events back. Button and Toggle turn them off
// while disabled, so their tooltip, often the one that says why ("An import is in progress"),
// never opened; browsers still send pointer events, but not clicks, to a disabled button.
const KeepChildState = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { "data-state"?: string; parentState?: string }
>(({ "data-state": _tooltipState, parentState, className, ...props }, ref) => (
  <Slot
    ref={ref}
    {...props}
    className={cn("disabled:pointer-events-auto", className)}
    {...(parentState !== undefined && { "data-state": parentState })}
  />
));
KeepChildState.displayName = "KeepChildState";

// Pointer moves an inner Tip has already answered. Tips nest (a badge inside a button, a
// button inside a drag-handle header) and a move bubbles to every trigger on its path; as
// with nested `title`s, the innermost one wins.
const answered = new WeakSet<Event>();

/**
 * The drop-in for a `title` attribute: `<Tip content="Close"><button>…</button></Tip>`.
 * Needs a TooltipProvider above it (both apps mount one at the root).
 *
 * Like `title`, it names an unlabelled trigger: when the trigger has no text, no aria-label and
 * no aria-labelledby, a string `content` becomes its aria-label, so icon-only buttons keep their
 * accessible name. It shows on a disabled button too: browsers send pointer events (not clicks)
 * to disabled controls, so the button stays the trigger and keeps its own layout, and Tip turns
 * back on the pointer events that Button and Toggle switch off while disabled.
 *
 * Tips can nest: over an inner trigger only the inner tooltip opens, and a trigger opens on
 * focus only for its own focus, not a child's (a header's tooltip stays shut while you tab
 * through its buttons).
 *
 * Like a title, the tooltip closes as soon as the pointer leaves the trigger and never takes a
 * click: one left open over the next thing you click (or a test clicks) lets the click through.
 */
const Tip = React.forwardRef<HTMLElement, TipProps>(
  ({ content, side, align, children, ...triggerProps }, forwardedRef) => {
    const ownRef = React.useRef<HTMLElement | null>(null);
    const label = typeof content === "string" ? content : null;
    React.useEffect(() => {
      const el = ownRef.current;
      if (!el || !label) return;
      // Only elements that take a name: ARIA prohibits aria-label on a plain span or div.
      const nameable = el.matches(
        "button, a[href], input, select, textarea, [role]:not([role=presentation]):not([role=none]):not([role=generic])",
      );
      if (!nameable) return;
      // After render, from the DOM: does the trigger have a name of its own? (An aria-label we
      // set earlier is ours to update.)
      const ownName =
        el.hasAttribute("aria-labelledby") ||
        (el.textContent ?? "").trim() !== "" ||
        (el.hasAttribute("aria-label") && el.dataset.tipLabel !== "true");
      if (ownName) return;
      el.setAttribute("aria-label", label);
      el.dataset.tipLabel = "true";
    }, [label]);
    const setRef = (node: HTMLElement | null) => {
      ownRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    // No tooltip, but the child still takes what a parent passes through Tip: under a
    // `DropdownMenuTrigger asChild` those are the menu's handlers, ARIA and ref.
    if (content == null || content === "") {
      return (
        <Slot ref={setRef} {...triggerProps}>
          {children}
        </Slot>
      );
    }
    return (
      <TooltipPrimitive.Root disableHoverableContent>
        <TooltipPrimitive.Trigger
          asChild
          ref={setRef}
          {...triggerProps}
          // These run before Radix's own handlers, which skip a defaultPrevented event. (Neither
          // event has a default action, so preventDefault changes nothing else.) Skipping the
          // handler, rather than refusing the open, also keeps Radix from announcing an open
          // that would close the inner tooltip.
          onPointerMove={(event) => {
            triggerProps.onPointerMove?.(event);
            if (answered.has(event.nativeEvent)) event.preventDefault();
            else answered.add(event.nativeEvent);
          }}
          onFocus={(event) => {
            triggerProps.onFocus?.(event);
            if (event.target !== event.currentTarget) event.preventDefault();
          }}
        >
          <KeepChildState parentState={(triggerProps as { "data-state"?: string })["data-state"]}>
            {children}
          </KeepChildState>
        </TooltipPrimitive.Trigger>
        <TooltipContent
          side={side}
          align={align}
          // Clicks pass through, to whatever is under the tooltip. Set on Radix's positioning
          // wrapper, which is the content's size; the content inherits it.
          ref={(node) => {
            if (node?.parentElement) node.parentElement.style.pointerEvents = "none";
          }}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    );
  },
);
Tip.displayName = "Tip";

export { Tip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
