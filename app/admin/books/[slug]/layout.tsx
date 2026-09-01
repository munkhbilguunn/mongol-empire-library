import type { Metadata } from "next";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type BookDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BookDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: book } = await supabase
    .from("books")
    .select("title, subtitle, description, publication_year, cover_path")
    .eq("slug", slug)
    .maybeSingle();

  if (!book) {
    return {
      title: "Ном олдсонгүй",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = book.title || "Ном";
  const description =
    book.description?.trim() ||
    book.subtitle?.trim() ||
    `${title}${book.publication_year ? ` (${book.publication_year})` : ""} — Монголын эзэнт гүрний түүхийн сан дахь номын мэдээлэл.`;

  let coverUrl: string | undefined;

  if (book.cover_path) {
    coverUrl = supabase.storage
      .from("book-covers")
      .getPublicUrl(book.cover_path).data.publicUrl;
  }

  return {
    title,
    description,

    openGraph: {
      type: "article",
      title,
      description,
      images: coverUrl
        ? [
            {
              url: coverUrl,
              alt: `${title} номын хавтас`,
            },
          ]
        : undefined,
    },

    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

export default function BookDetailLayout({
  children,
}: BookDetailLayoutProps) {
  return children;
}
