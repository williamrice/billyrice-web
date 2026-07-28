import { describe, expect, it } from "vitest";
import { escapeHtml } from "../../lib/utils/strings";

describe("string utilities", () => {
  it("escapes untrusted HTML content", () => {
    expect(escapeHtml(`<script>alert("test")</script> & 'quoted'`)).toBe(
      "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;",
    );
  });
});
