import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { BRAND_ORG_NAME, BRAND_SHORT } from "@/lib/brand";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: `${BRAND_SHORT} — ${BRAND_ORG_NAME}`,
  description:
    "Explore endangered endemic species worldwide, read conservation books, earn points, and support ethical education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-stone-50 text-stone-900 antialiased`}
      >
        <SiteNav />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
