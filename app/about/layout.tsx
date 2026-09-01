import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Төслийн тухай",
  description:
    "Монголын эзэнт гүрний түүхийн сан төслийн зорилго, хамрах хүрээ, мэдээллийн сангийн бүтэц болон ашиглах боломжийн тухай.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Төслийн тухай",
    description:
      "Монголын эзэнт гүрний түүхийн сан төслийн зорилго, хамрах хүрээ.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
