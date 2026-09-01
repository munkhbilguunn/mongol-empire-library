import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/books`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/authors`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/sources`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/timeline`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const [booksResult, authorsResult, sourcesResult] = await Promise.all([
    supabase.from("books").select("slug").not("slug", "is", null),
    supabase.from("authors").select("slug").not("slug", "is", null),
    supabase.from("sources").select("slug").not("slug", "is", null),
  ]);

  const bookRoutes: MetadataRoute.Sitemap = (booksResult.data || [])
    .filter((book: any) => book.slug)
    .map((book: any) => ({
      url: `${siteUrl}/books/${book.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const authorRoutes: MetadataRoute.Sitemap = (authorsResult.data || [])
    .filter((author: any) => author.slug)
    .map((author: any) => ({
      url: `${siteUrl}/authors/${author.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const sourceRoutes: MetadataRoute.Sitemap = (sourcesResult.data || [])
    .filter((source: any) => source.slug)
    .map((source: any) => ({
      url: `${siteUrl}/sources/${source.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    ...staticRoutes,
    ...bookRoutes,
    ...authorRoutes,
    ...sourceRoutes,
  ];
}
