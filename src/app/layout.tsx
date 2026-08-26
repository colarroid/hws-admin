import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AdminNav } from "@/components/admin/AdminNav";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HWS admin",
  description: "Internal tools for the HWS Portal.",
  // Internal only. Keep it out of search results whatever else happens.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col bg-ground text-ink">
          <header className="border-b border-hairline bg-ground">
            <div className="mx-auto flex max-w-[1100px] items-center gap-[14px] px-10 py-[18px]">
              <span className="text-[15px] font-bold uppercase tracking-[0.14em] text-ink">
                Logo
              </span>
              <span className="rounded-full border border-gold-300 bg-gold-200 px-3 py-1 text-[13px] font-semibold text-gold-700">
                Admin
              </span>
              <div className="ml-auto"><AdminNav /></div>
            </div>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
