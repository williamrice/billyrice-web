import { describe, expect, it } from "vitest";
import { postInputSchema } from "../../features/publishing/schemas/post";
import { slugify } from "../../lib/utils/strings";
import { PublicationStatus } from "../../features/publishing/types/publication";

const validPost = {
  title: "A dependable publishing system",
  slug: "dependable-publishing-system",
  excerpt: "How a small publishing system stays safe and maintainable.",
  markdown: "## The approach\n\nStore Markdown as the canonical source and render it safely.",
  status: PublicationStatus.Draft,
};

describe("post schemas", () => {
  it("accepts a valid Markdown draft", () => {
    expect(postInputSchema.safeParse(validPost).success).toBe(true);
  });

  it("rejects unsafe or unstable slug shapes", () => {
    expect(postInputSchema.safeParse({ ...validPost, slug: "../Bad Slug" }).success).toBe(false);
  });

  it("creates a stable slug suggestion from a title", () => {
    expect(slugify("  AI, Architecture & Reality  ")).toBe(
      "ai-architecture-reality",
    );
  });
});
