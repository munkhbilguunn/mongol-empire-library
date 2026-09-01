import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Он цагийн хэлхээс",
  description:
    "Монголын эзэнт гүрний үүсэл, тэлэлт, бүрэлдэхүүн улсуудын түүхэн үйл явдлыг он дарааллаар үзэх он цагийн хэлхээс.",
  alternates: {
    canonical: "/timeline",
  },
  openGraph: {
    title: "Он цагийн хэлхээс",
    description:
      "Монголын эзэнт гүрний түүхэн үйл явдлыг он дарааллаар судлах.",
    url: "/timeline",
  },
};

export default function TimelineLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
