import { getMermaidSvgDimensions } from "./mermaid";

// Mermaid's HTML labels can contain HTML void tags such as <br>. Reparse as
// HTML, as the preview does, then serialize the SVG as well-formed XML.
export function serializeMermaidSvg(svg: string) {
  const container = document.createElement("div");
  container.innerHTML = svg;
  const element = container.querySelector("svg");
  if (!element) throw new Error("The diagram SVG could not be exported.");
  const serialized = new XMLSerializer().serializeToString(element);
  const parsed = new DOMParser().parseFromString(serialized, "image/svg+xml");
  if (parsed.querySelector("parsererror")) throw new Error("The diagram SVG is not valid XML.");
  return serialized;
}

export async function mermaidSvgToPng(svg: string, backgroundColor = "#ffffff"): Promise<Blob> {
  const dimensions = getMermaidSvgDimensions(svg);
  if (!dimensions) throw new Error("The diagram has no valid export size.");
  const scale = Math.min(2, 4096 / Math.max(dimensions.width, dimensions.height),
    Math.sqrt(16_000_000 / (dimensions.width * dimensions.height)));
  const width = Math.max(1, Math.round(dimensions.width * scale));
  const height = Math.max(1, Math.round(dimensions.height * scale));
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available for PNG export.");
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("The PNG could not be created.");
    return png;
  } finally {
    URL.revokeObjectURL(url);
  }
}
