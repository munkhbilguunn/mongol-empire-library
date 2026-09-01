import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Номын сан",
  description:
    "Монголын эзэнт гүрэн, Их Монгол улс, Юань улс, Цагадайн улс, Ил хант улс, Алтан ордны улсын түүхтэй холбоотой ном, судалгааны бүтээлийн сан.",
  alternates: {
    canonical: "/books",
  },
  openGraph: {
    title: "Номын сан",
    description:
      "Монголын эзэнт гүрний түүхтэй холбоотой ном, судалгааны бүтээлүүдийг үзэх.",
    url: "/books",
  },
};

export default function BooksLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
