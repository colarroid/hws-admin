import type { Metadata } from "next";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdmin } from "@/lib/data/admin";
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
  /* Every screen sets its own title; the template adds the suffix. The
     default covers only the root redirect, which never paints. */
  title: {
    default: "HWS admin",
    template: "%s | HWS admin",
  },
  description: "Internal tools for the HWS Portal.",
  // Internal only. Keep it out of search results whatever else happens.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Nothing here is reachable signed out except sign-in itself, so the header
  // has nothing to say until there is an admin. Rendering it anyway left the
  // sign-in screen wearing a bar with an empty right-hand side.
  const admin = await getAdmin();

  return (
    <html lang="en-GB" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col bg-ground text-ink">
          {admin ? (
          <header className="sticky top-0 z-20 border-b border-hairline bg-ground">
            {/* relative so the mobile panel can hang off the bottom edge */}
            <div className="relative flex w-full items-center gap-[14px] px-5 py-[18px] sm:px-8 lg:px-10">
              {/* Not a link, matching what was here before: the admin tools
                  have no public front page to return to. So the name lives on
                  alt rather than on a wrapper. */}
              <Image
                src="/logo.svg"
                alt="HWS Pathgrid"
                width={100}
                height={36}
                priority
                className="shrink-0"
                // Served as authored. The image optimiser does not process
                // SVG, and there is nothing to gain from it on a 5KB vector.
                unoptimized
              />
              <div className="ml-auto flex items-center"><AdminNav /></div>
            </div>
          </header>
          ) : null}
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
