import { SITE_URL } from "../site";

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  return new URL(path, `${SITE_URL}/`).toString();
}
