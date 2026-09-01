import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Нэгдсэн хайлт",
  description:
    "Монголын эзэнт гүрний түүхийн сангаас ном, зохиогч, судлаач, эх сурвалж болон он цагийн мэдээллийг нэг дороос хайх.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
