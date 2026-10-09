import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Button,
  Card,
  CardContent,
  Combobox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
