import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  CardContent,
  Combobox,
  Input,
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
  TabsList,
  TabsTrigger,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
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
