export const SITE_NAME = 'Billy Rice';
export const SITE_URL = 'https://billyrice.com';

export function absoluteUrl(path = '') {
  if (!path) {
    return SITE_URL;
  }

  return new URL(path, `${SITE_URL}/`).toString();
}
