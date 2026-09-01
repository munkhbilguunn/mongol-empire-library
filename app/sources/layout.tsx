import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Эх сурвалж",
  description:
    "Монголын эзэнт гүрний түүхийг судлахад чухал түүхэн сурвалж бичгүүд, тэдгээрийн агуулга, түүхэн нөхцөл, судалгааны ач холбогдлын мэдээлэл.",
  alternates: {
    canonical: "/sources",
  },
  openGraph: {
    title: "Эх сурвалж",
    description:
      "Монголын эзэнт гүрний түүхийн гол эх сурвалжуудын мэдээллийн сан.",
    url: "/sources",
  },
};

export default function SourcesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
