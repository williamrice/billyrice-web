const OBJECT_URL_REVOKE_DELAY_MS = 1_000;

export async function copyTextToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function downloadTextFile(content: string, filename: string, mimeType: string) {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
  }
}
