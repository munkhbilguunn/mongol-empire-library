import type { Metadata } from "next";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type SourceDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: SourceDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: source } = await supabase
    .from("sources")
    .select(
      "title, title_original, title_en, summary, historical_context, written_period, author_compiler"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!source) {
    return {
      title: "Эх сурвалж олдсонгүй",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = source.title || source.title_original || source.title_en || "Эх сурвалж";

  const description =
    source.summary?.trim() ||
    source.historical_context?.trim() ||
    `${title}${source.written_period ? ` — ${source.written_period}` : ""}${
      source.author_compiler ? `, ${source.author_compiler}` : ""
    }. Монголын эзэнт гүрний түүхийн сан дахь түүхэн эх сурвалжийн мэдээлэл.`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function SourceDetailLayout({
  children,
}: SourceDetailLayoutProps) {
  return children;
}
