import { absoluteUrl } from './site';

/**
 * Generate canonical URL for the site
 */
export function generateCanonicalUrl(path: string = ''): string {
  return absoluteUrl(path);
}

/**
 * Generate metadata with canonical URL
 */
export function generateMetadataWithCanonical(path: string = '', title?: string, description?: string) {
  return {
    alternates: {
      canonical: generateCanonicalUrl(path),
    },
    ...(title && { title }),
    ...(description && { description }),
  };
}
