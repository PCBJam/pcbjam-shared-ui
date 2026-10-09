import * as React from "react";
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
        "z-[1000] max-w-72 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type TipProps = Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>, "content"> & {
  /** The tooltip text; nothing (or "") renders the child alone. */
  content: React.ReactNode;
  side?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["side"];
  align?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["align"];
  children: React.ReactElement<{ disabled?: boolean; style?: React.CSSProperties }>;
};

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
 * accessible name. A disabled trigger gets no pointer events, so it is wrapped in a focusable
 * span that carries the tooltip instead, as a native title would still show.
 *
 * Tips can nest: over an inner trigger only the inner tooltip opens, and a trigger opens on
 * focus only for its own focus, not a child's (a header's tooltip stays shut while you tab
 * through its buttons).
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
    if (content == null || content === "") return children;
    const setRef = (node: HTMLElement | null) => {
      ownRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const disabled = children.props.disabled === true;
    // The child's own ref, kept when the disabled path clones it with ours.
    const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref;
    const trigger = disabled ? (
      <span tabIndex={0} className="inline-flex">
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          style: { ...children.props.style, pointerEvents: "none" },
          ref: (node: HTMLElement | null) => {
            setRef(node);
            if (typeof childRef === "function") childRef(node);
            else if (childRef) (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
          },
        })}
      </span>
    ) : (
      children
    );
    return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          asChild
          ref={disabled ? undefined : setRef}
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
          {trigger}
        </TooltipPrimitive.Trigger>
        <TooltipContent side={side} align={align}>
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    );
  },
);
Tip.displayName = "Tip";

export { Tip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
