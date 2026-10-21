import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenstone.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/properties", "/properties/*", "/compare"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/login",
          "/signin",
          "/signup",
          "/profile",
          "/profile/*",
          "/favorites",
          "/favorites/*",
          "/forgot-password",
          "/reset-password",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/properties", "/properties/*", "/compare"],
        disallow: [
          "/dashboard/*",
          "/admin/*",
          "/api/*",
          "/login",
          "/signup",
          "/profile/*",
          "/favorites/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
