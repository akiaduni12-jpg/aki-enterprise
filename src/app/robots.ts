import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://akiaduniventures.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/api/",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/account",
          "/account/*",
          "/cart",
          "/cart/*",
          "/track",
          "/track/*",
          "/*?*admin*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/api/",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/account",
          "/account/*",
          "/cart",
          "/cart/*",
          "/track",
          "/track/*",
          "/*?*admin*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
