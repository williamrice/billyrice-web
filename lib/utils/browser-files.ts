export async function copyTextToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function downloadTextFile(content: string, filename: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
