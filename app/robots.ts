import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://rehome-city.vercel.app");

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
