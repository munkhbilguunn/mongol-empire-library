import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Зохиогч, судлаачид",
  description:
    "Монголын эзэнт гүрний түүх, Монгол судлал болон холбогдох салбарын зохиогч, судлаачдын мэдээлэл, бүтээлийн бүртгэл.",
  alternates: {
    canonical: "/authors",
  },
  openGraph: {
    title: "Зохиогч, судлаачид",
    description:
      "Монголын эзэнт гүрний түүхтэй холбоотой зохиогч, судлаачдын мэдээлэл.",
    url: "/authors",
  },
};

export default function AuthorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
