import { absoluteUrl } from "@/lib/utils/urls";

export function generateCanonicalUrl(path = "") {
  return absoluteUrl(path);
}

export function generateMetadataWithCanonical(
  path = "",
  title?: string,
  description?: string,
) {
  return {
    alternates: {
      canonical: generateCanonicalUrl(path),
    },
    ...(title && { title }),
    ...(description && { description }),
  };
}
