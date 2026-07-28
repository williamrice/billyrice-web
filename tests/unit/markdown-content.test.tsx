import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownContent } from "../../features/publishing/components/MarkdownContent";

describe("MarkdownContent", () => {
  it("renders Markdown while suppressing raw HTML", () => {
    const html = renderToStaticMarkup(
      <MarkdownContent markdown={"## Safe heading\n\n<script>alert('no')</script>\n\n**Useful text**"} />,
    );

    expect(html).toContain("Safe heading");
    expect(html).toContain("<strong>Useful text</strong>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert");
  });
});
