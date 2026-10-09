import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const TONES = ["neutral", "primary", "success", "warning", "danger", "info", "preview"] as const;
type Tone = (typeof TONES)[number];

// One class set per tone and variant. The tone colours are tokens (theme.css) with their own
// dark values, so a soft badge stays a tint and its text stays readable in both themes.
const TONE_CLASSES: Record<Tone, { soft: string; outline: string; solid: string }> = {
  neutral: { soft: "bg-muted text-muted-foreground", outline: "border-border text-muted-foreground", solid: "bg-foreground text-background" },
  primary: { soft: "bg-primary/10 text-primary", outline: "border-primary/40 text-primary", solid: "bg-primary text-primary-foreground" },
  success: { soft: "bg-success/15 text-success", outline: "border-success/40 text-success", solid: "bg-success text-background" },
  warning: { soft: "bg-warning/15 text-warning", outline: "border-warning/40 text-warning", solid: "bg-warning text-background" },
  danger: { soft: "bg-danger/15 text-danger", outline: "border-danger/40 text-danger", solid: "bg-danger text-background" },
  info: { soft: "bg-info/15 text-info", outline: "border-info/40 text-info", solid: "bg-info text-background" },
  preview: { soft: "bg-preview/15 text-preview", outline: "border-preview/40 text-preview", solid: "bg-preview text-background" },
};

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap border font-medium [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: Object.fromEntries(TONES.map((t) => [t, ""])) as Record<Tone, string>,
      variant: {
        soft: "border-transparent",
        outline: "bg-transparent",
        solid: "border-transparent",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 text-[11px] leading-4",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
    },
    compoundVariants: TONES.flatMap((tone) =>
      (["soft", "outline", "solid"] as const).map((variant) => ({ tone, variant, class: TONE_CLASSES[tone][variant] })),
    ),
    defaultVariants: { tone: "neutral", variant: "soft", size: "default", shape: "rounded" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** A short label or status: tone says what it means, variant how loud it is. */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, variant, size, shape, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ tone, variant, size, shape }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
