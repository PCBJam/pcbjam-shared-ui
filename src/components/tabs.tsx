import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva("", {
  variants: {
    variant: {
      // Triggers on a muted track, the active one raised: for a few sibling panels.
      segmented: "inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
      // A row of labels over a rule, the active one underlined: for page sections.
      underline: "flex items-center gap-4 border-b",
      // A column of icon tabs beside the panels (an activity bar): use with orientation="vertical".
      rail: "flex flex-col gap-1",
    },
  },
  defaultVariants: { variant: "segmented" },
});

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        segmented:
          "h-7 rounded-md px-3 hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline:
          "-mb-px border-b-2 border-transparent px-1 pb-2 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
        rail: "relative h-10 justify-start gap-2.5 rounded-md px-2.5 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "segmented" },
  },
);

type TabsVariant = VariantProps<typeof tabsListVariants>["variant"];
const TabsVariantContext = React.createContext<TabsVariant>("segmented");

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsVariantContext.Provider value={variant ?? "segmented"}>
    <TabsPrimitive.List ref={ref} className={cn(tabsListVariants({ variant }), className)} {...props} />
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  return <TabsPrimitive.Trigger ref={ref} className={cn(tabsTriggerVariants({ variant }), className)} {...props} />;
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
