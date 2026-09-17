import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { TooltipProvider } from "../../components/ui/tooltip";
import { MermaidPreview } from "../../features/tools/mermaid/components/MermaidPreview";

describe("Mermaid preview server markup", () => {
  it("renders unavailable controls consistently without native disabled attributes", () => {
    const html = renderToString(
      <TooltipProvider>
        <MermaidPreview svg="" canExport={false} onCopySvg={() => {}} onDownloadSvg={() => {}} onDownloadPng={() => {}} />
      </TooltipProvider>,
    );

    for (const label of ["Fit diagram to preview", "Copy SVG", "Download diagram"]) {
      const button = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0];
      expect(button, label).toContain('aria-disabled="true"');
      expect(button, label).not.toMatch(/\sdisabled(?:=|\s|>)/);
    }
  });
});
