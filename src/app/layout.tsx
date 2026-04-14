import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "CEO Defense — Dokážeš vybudovať firmu?",
  description:
    "Interaktívna hra pre podnikateľov. Prežiješ 5 vĺn biznis problémov?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
