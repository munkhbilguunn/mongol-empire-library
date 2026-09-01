import type { Metadata } from "next";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type AuthorDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: AuthorDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: author } = await supabase
    .from("authors")
    .select("name, name_mn, name_en, biography, birth_year, death_year")
    .eq("slug", slug)
    .maybeSingle();

  if (!author) {
    return {
      title: "Зохиогч олдсонгүй",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name =
    author.name_mn ||
    author.name ||
    author.name_en ||
    "Зохиогч, судлаач";

  const years =
    author.birth_year || author.death_year
      ? ` (${author.birth_year || "?"}–${author.death_year || ""})`
      : "";

  const description =
    author.biography?.trim() ||
    `${name}${years} — Монголын эзэнт гүрний түүхийн сан дахь зохиогч, судлаачийн мэдээлэл.`;

  return {
    title: name,
    description,
    openGraph: {
      type: "profile",
      title: name,
      description,
    },
    twitter: {
      card: "summary",
      title: name,
      description,
    },
  };
}

export default function AuthorDetailLayout({
  children,
}: AuthorDetailLayoutProps) {
  return children;
}
