import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../lib/utils";

/**
 * shadcn/ui's Slider: one thumb on a track, the same in every browser (a native range input is
 * drawn by the OS). Arrow keys step, Shift+arrow steps ten, Home and End jump to the ends.
 * `thumbLabel` names the thumb, the element that takes focus and the slider role.
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { thumbLabel?: string }
>(({ className, thumbLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      className="block size-4 rounded-full border border-primary/50 bg-card shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
