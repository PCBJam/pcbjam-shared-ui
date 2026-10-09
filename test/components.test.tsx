import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  CardContent,
  Code,
  Combobox,
  DropdownMenu,
  DropdownMenuTrigger,
  Input,
  Kbd,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  Tip,
  Toaster,
  toast,
  TabsList,
  TabsTrigger,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  TooltipProvider,
} from "../src";

describe("components render with their token classes", () => {
  it("Button: default and outline variants", () => {
    expect(renderToStaticMarkup(<Button>Go</Button>)).toContain("bg-primary");
    const outline = renderToStaticMarkup(<Button variant="outline">Go</Button>);
    expect(outline).toContain("border-input");
    expect(outline).toContain("bg-card");
  });

  it("Button: a caller's class wins over the variant's", () => {
    const html = renderToStaticMarkup(<Button className="h-12">Go</Button>);
    expect(html).toContain("h-12");
    expect(html).not.toContain("h-9");
  });

  it("Button: the boxed sizes set the type, size text takes the surrounding font", () => {
    const boxed = renderToStaticMarkup(<Button size="sm">Go</Button>);
    expect(boxed).toContain("text-xs");
    expect(boxed).toContain("font-medium");
    expect(boxed).toContain("[&amp;_svg]:size-4");
    const text = renderToStaticMarkup(
      <Button variant="inline" size="text">
        Retry
      </Button>,
    );
    expect(text).not.toMatch(/text-(xs|sm)|font-medium|size-4|h-9|px-4/);
    expect(text).toContain("whitespace-normal");
  });

  it("Button: link and inline are text in the surrounding colour", () => {
    const link = renderToStaticMarkup(
      <Button variant="link" size="text">
        Or use SSH instead
      </Button>,
    );
    expect(link).toContain("hover:underline");
    expect(link).not.toMatch(/text-primary|bg-/);
    const inline = renderToStaticMarkup(
      <Button variant="inline" size="text">
        let PCBJam generate one
      </Button>,
    );
    expect(inline).toMatch(/class="[^"]*(^|\s)underline(\s|")/);
    expect(inline).not.toMatch(/text-primary|bg-/);
  });

  it("Button: asChild renders the child element", () => {
    const html = renderToStaticMarkup(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>,
    );
    expect(html).toMatch(/^<a [^>]*href="\/x"/);
  });

  it("Input, Label and Card", () => {
    expect(renderToStaticMarkup(<Input placeholder="Name" />)).toMatch(/^<input [^>]*bg-card/);
    expect(renderToStaticMarkup(<Label htmlFor="n">Name</Label>)).toMatch(/^<label /);
    expect(
      renderToStaticMarkup(
        <Card>
          <CardContent>Body</CardContent>
        </Card>,
      ),
    ).toContain("bg-card");
  });
});

describe("Select and Combobox triggers expose their value", () => {
  it("Select: data-value on the trigger, placeholder when nothing is chosen", () => {
    const html = renderToStaticMarkup(
      <Select value="">
        <SelectTrigger data-testid="kind">
          <SelectValue placeholder="All kinds" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="symbol">Symbols</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(html).toMatch(/<button [^>]*data-value=""/);
    expect(html).toContain("All kinds");
  });

  it("Select: a controlled value lands in data-value", () => {
    const html = renderToStaticMarkup(
      <Select value="footprint">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    expect(html).toContain('data-value="footprint"');
  });

  it("Combobox: shows the chosen option's label, or the placeholder", () => {
    const options = [
      { value: "main", label: "main", group: "Branches" },
      { value: "v1.0", label: "v1.0", group: "Tags" },
    ];
    const chosen = renderToStaticMarkup(<Combobox options={options} value="v1.0" onValueChange={() => {}} />);
    expect(chosen).toContain('data-value="v1.0"');
    expect(chosen).toContain(">v1.0</span>");
    expect(chosen).not.toContain("data-placeholder");
    const empty = renderToStaticMarkup(
      <Combobox options={options} value="" placeholder="Pick a branch" onValueChange={() => {}} />,
    );
    expect(empty).toContain("Pick a branch");
    expect(empty).toContain('data-placeholder=""');
  });
});

describe("Badge count and Code", () => {
  it("a count badge is a 16px pill whatever its shape prop says", () => {
    const html = renderToStaticMarkup(
      <Badge size="count" tone="primary" variant="solid">
        12
      </Badge>,
    );
    expect(html).toContain("rounded-full");
    expect(html).not.toContain("rounded-md");
    expect(html).toContain("h-4");
    expect(html).toContain("bg-primary");
  });

  it("Code is a code element on a muted chip; layout classes win", () => {
    expect(renderToStaticMarkup(<Code>a1b2c3d</Code>)).toBe(
      '<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">a1b2c3d</code>',
    );
    const box = renderToStaticMarkup(<Code className="block px-2 py-1 text-sm">ssh-ed25519 AAAA</Code>);
    expect(box).toContain("px-2 py-1 text-sm");
    expect(box).not.toMatch(/px-1\.5|py-0\.5|text-xs/);
  });
});

describe("Kbd", () => {
  it("is a kbd element that takes no clicks; the caller's classes win", () => {
    const html = renderToStaticMarkup(<Kbd className="px-1.5 text-[10px]">⌘\</Kbd>);
    expect(html).toMatch(/^<kbd class="[^"]*pointer-events-none/);
    expect(html).toContain("px-1.5");
    expect(html).not.toMatch(/ px-1 | text-xs /);
  });
});

describe("Badge", () => {
  it("defaults to a soft neutral label", () => {
    const html = renderToStaticMarkup(<Badge>pending</Badge>);
    expect(html).toMatch(/^<span /);
    expect(html).toContain("bg-muted");
    expect(html).toContain("rounded-md");
  });

  it("tone and variant pick the token classes", () => {
    expect(renderToStaticMarkup(<Badge tone="success">ready</Badge>)).toContain("bg-success/15 text-success");
    expect(renderToStaticMarkup(<Badge tone="danger" variant="outline">failed</Badge>)).toContain("border-danger/40 text-danger");
    expect(renderToStaticMarkup(<Badge tone="primary" variant="solid" shape="pill">3</Badge>)).toMatch(/bg-primary text-primary-foreground.*rounded-full|rounded-full.*bg-primary text-primary-foreground/);
  });
});

describe("Tabs, ToggleGroup and Toggle keep the ARIA roles specs rely on", () => {
  it("Tabs: triggers are tabs, the active one selected", () => {
    const html = renderToStaticMarkup(
      <Tabs value="b">
        <TabsList variant="underline">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>A</);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>B</);
    expect(html).toContain("border-b");
  });

  it("ToggleGroup single: items are radios, the chosen one checked", () => {
    const html = renderToStaticMarkup(
      <ToggleGroup type="single" variant="segmented" value="7d" onValueChange={() => {}}>
        <ToggleGroupItem value="24h">24 h</ToggleGroupItem>
        <ToggleGroupItem value="7d">7 d</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(html).toMatch(/role="radio" aria-checked="true"[^>]*>7 d</);
    expect(html).toContain("bg-muted");
  });

  it("Toggle: a pressed button", () => {
    expect(renderToStaticMarkup(<Toggle pressed>Comments</Toggle>)).toMatch(/<button [^>]*aria-pressed="true"/);
  });

  it("Toggle: the default sizes fix the icon at 16px, row and xs leave the icon's own size", () => {
    expect(renderToStaticMarkup(<Toggle>x</Toggle>)).toContain("[&amp;_svg]:size-4");
    const row = renderToStaticMarkup(
      <Toggle variant="ghost" size="row" className="hover:bg-black/5">
        x
      </Toggle>,
    );
    expect(row).not.toContain("size-4");
    expect(row).toContain("w-full");
    // The caller's hover fill replaces the variant's.
    expect(row).toContain("hover:bg-black/5");
    expect(row).not.toContain("hover:bg-accent");
    expect(renderToStaticMarkup(<Toggle variant="ghost" size="xs">x</Toggle>)).not.toContain("size-4");
  });
});

describe("Checkbox, RadioGroup and Switch expose the roles Playwright's check() needs", () => {
  it("Checkbox: role checkbox with aria-checked", () => {
    expect(renderToStaticMarkup(<Checkbox checked aria-label="models" />)).toMatch(/role="checkbox" aria-checked="true"/);
    expect(renderToStaticMarkup(<Checkbox checked={false} aria-label="models" />)).toMatch(/aria-checked="false"/);
  });

  it("RadioGroup: a radiogroup of radios, the chosen one checked", () => {
    const html = renderToStaticMarkup(
      <RadioGroup value="here">
        <RadioGroupItem value="new" aria-label="New folder" />
        <RadioGroupItem value="here" aria-label="This folder" />
      </RadioGroup>,
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toMatch(/role="radio" aria-checked="true"[^>]*aria-label="This folder"|aria-label="This folder"[^>]*role="radio" aria-checked="true"/);
  });

  it("Switch: role switch with aria-checked", () => {
    expect(renderToStaticMarkup(<Switch checked aria-label="grant git" />)).toMatch(/role="switch" aria-checked="true"/);
  });
});

describe("Tip", () => {
  it("wraps the trigger without a native title", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <Tip content="Close">
          <button type="button">x</button>
        </Tip>
      </TooltipProvider>,
    );
    expect(html).toMatch(/^<button [^>]*type="button"/);
    expect(html).not.toContain("title=");
  });

  it("leaves the child's own data-state alone (a tab stays active, so its styles apply)", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <Tabs value="a">
          <TabsList>
            <Tip content="Quick actions">
              <TabsTrigger value="a">A</TabsTrigger>
            </Tip>
          </TabsList>
        </Tabs>
      </TooltipProvider>,
    );
    expect(html).toMatch(/<button [^>]*data-state="active"/);
    expect(html).not.toMatch(/data-state="closed"/);
  });

  it("turns a disabled Button's pointer events back on, so its tooltip can open", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <Tip content="An import is in progress">
          <Button disabled>Upload</Button>
        </Tip>
      </TooltipProvider>,
    );
    expect(html).toContain("disabled:pointer-events-auto");
    expect(html).not.toContain("disabled:pointer-events-none");
    expect(renderToStaticMarkup(<Button disabled>Upload</Button>)).toContain("disabled:pointer-events-none");
  });

  it("passes a parent trigger's data-state through (a menu's open)", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Tip content="Upload files">
              <button type="button">Upload</button>
            </Tip>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </TooltipProvider>,
    );
    expect(html).toMatch(/^<button [^>]*data-state="open"/);
  });

  it("renders the child alone when there is no content", () => {
    expect(renderToStaticMarkup(<Tip content="">{<button type="button">x</button>}</Tip>)).toBe('<button type="button">x</button>');
  });

  it("passes a parent trigger's props to the child when there is no content", () => {
    // <DropdownMenuTrigger asChild><Tip content={busy ? "…" : undefined}>: the menu's handlers
    // and ARIA must reach the button whether or not the tooltip shows.
    const html = renderToStaticMarkup(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Tip content={undefined}>
            <button type="button">Upload</button>
          </Tip>
        </DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(html).toMatch(/^<button [^>]*aria-haspopup="menu"/);
    expect(html).toMatch(/^<button [^>]*data-state="closed"/);
  });
});

describe("Toaster", () => {
  it("renders Sonner's notification region, and toast is callable", () => {
    expect(renderToStaticMarkup(<Toaster />)).toMatch(/<section aria-label="Notifications/);
    expect(typeof toast.error).toBe("function");
  });
});
