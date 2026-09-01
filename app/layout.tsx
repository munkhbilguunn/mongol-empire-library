import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Монголын эзэнт гүрний түүхийн сан",
    template: "%s | Монголын эзэнт гүрний түүхийн сан",
  },

  description:
    "Монголын эзэнт гүрэн, түүний бүрэлдэхүүн улсуудын түүхтэй холбоотой ном, зохиогч, судлаач, эх сурвалж болон он цагийн мэдээллийг нэг дороос судлах цахим сан.",

  keywords: [
    "Монголын эзэнт гүрэн",
    "Монголын түүх",
    "Их Монгол улс",
    "Юань улс",
    "Цагадайн улс",
    "Ил хант улс",
    "Алтан ордны улс",
    "түүхийн ном",
    "түүхэн эх сурвалж",
    "Монгол судлал",
  ],

  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: siteUrl,
    siteName: "Монголын эзэнт гүрний түүхийн сан",
    title: "Монголын эзэнт гүрний түүхийн сан",
    description:
      "Монголын эзэнт гүрэн, түүний бүрэлдэхүүн улсуудын түүхтэй холбоотой ном, зохиогч, судлаач, эх сурвалж болон он цагийн мэдээллийг нэг дороос судлах цахим сан.",
  },

  twitter: {
    card: "summary",
    title: "Монголын эзэнт гүрний түүхийн сан",
    description:
      "Монголын эзэнт гүрний түүхтэй холбоотой ном, судлаач, эх сурвалж болон он цагийн мэдээллийн цахим сан.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
