import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outage Reporter Ethiopia",
  description:
    "Crowdsourced reports for power and water outages across Ethiopia. ኢትዮጵያ ውስጥ የኤሌክትሪክ እና የውሃ ማቋረጥ መግለጫ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="w-full border-b border-black/[.06] dark:border-white/[.12] bg-[--header-bg] backdrop-blur supports-[backdrop-filter]:bg-[--header-bg]/80 sticky top-0 z-20">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 select-none">
                <span className="inline-block h-6 w-6 rounded-md bg-[--color-brand]" />
                <span className="text-base sm:text-lg font-semibold tracking-tight">ኢትዮ አውታጅ · Outage Reporter</span>
              </Link>
              <nav className="text-xs sm:text-sm opacity-90 flex items-center gap-2">
                <Link href="/about" className="group inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--color-brand] opacity-0 group-hover:opacity-100" />
                  About
                </Link>
                <a href="https://vercel.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                  Deploy
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-10">
            {children}
          </main>
          <footer className="max-w-5xl mx-auto w-full px-4 py-8 text-xs opacity-80">
            <p>Made for Ethiopia. ይጠቀሙ እና አጋሩ።</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
