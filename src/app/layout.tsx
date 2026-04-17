import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEO Defense — Dokážeš vybudovať firmu?",
  description:
    "Biznis simulátor. 10 mesiacov. 10 pozícií. Vybuduješ firmu, ktorá funguje bez teba?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className={`${interTight.variable} ${plexMono.variable}`}>
      <body className={`${interTight.className} antialiased`}>{children}</body>
    </html>
  );
}
