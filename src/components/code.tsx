import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Inline code, or an id, sha, path or key in running text: monospace on a muted chip. Give it
 * layout classes to make a copyable value box (`block select-all break-all px-2 py-1`).
 */
const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <code ref={ref} className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-xs", className)} {...props} />
));
Code.displayName = "Code";

export { Code };
