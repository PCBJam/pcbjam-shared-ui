import * as React from "react";
import { Toaster as Sonner, toast, type ExternalToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Sonner's colours, from the theme tokens (theme.css): a toast follows the app's light and dark
// themes, and the tones match Badge's. Set inline on the toaster element, they win over the
// values Sonner's own stylesheet sets there.
const tone = (token: string) => ({
  bg: `color-mix(in srgb, hsl(var(--${token})) 12%, hsl(var(--card)))`,
  border: `color-mix(in srgb, hsl(var(--${token})) 35%, hsl(var(--card)))`,
  text: `hsl(var(--${token}))`,
});
const TONES = { success: tone("success"), info: tone("info"), warning: tone("warning"), error: tone("danger") };
const TOKEN_STYLE = {
  "--normal-bg": "hsl(var(--card))",
  "--normal-bg-hover": "hsl(var(--accent))",
  "--normal-border": "hsl(var(--border))",
  "--normal-border-hover": "hsl(var(--border))",
  "--normal-text": "hsl(var(--card-foreground))",
  ...Object.fromEntries(
    Object.entries(TONES).flatMap(([type, c]) => [
      [`--${type}-bg`, c.bg],
      [`--${type}-border`, c.border],
      [`--${type}-text`, c.text],
    ]),
  ),
} as React.CSSProperties;

/** "dark" while the root element has the `dark` class (how both apps switch theme). */
function useDocumentTheme(): "light" | "dark" {
  const read = (): "light" | "dark" =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
  const [theme, setTheme] = React.useState(read);
  React.useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

/**
 * shadcn/ui's Sonner: mount one `Toaster` at the app root, then call `toast()` from anywhere.
 * `toast.error`, `toast.warning`, `toast.info` and `toast.success` take the tone colours
 * (richColors is on); a plain `toast()` uses the card colours.
 */
function Toaster({ theme, style, ...props }: ToasterProps) {
  const documentTheme = useDocumentTheme();
  return <Sonner theme={theme ?? documentTheme} richColors style={{ ...TOKEN_STYLE, ...style }} {...props} />;
}

export { Toaster, toast, type ExternalToast };
