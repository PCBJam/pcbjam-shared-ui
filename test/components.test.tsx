import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, Card, CardContent, Input, Label } from "../src";

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
