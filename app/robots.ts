import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/account-settings/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
