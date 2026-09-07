import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/footer/Footer";
import { Starfield } from "@/components/ui/Starfield";
import { site } from "@/data/site";
import "./globals.css";

/* Orbitron is the display face used throughout the Figma hero
   (Black / Bold / SemiBold). Space Grotesk carries body copy — Orbitron is
   unreadable below ~14px and at paragraph length. */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} ${site.year} — ${site.description.split("—")[0].trim()}`,
    template: `%s — ${site.name} ${site.year}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} ${site.year}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06030e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        {/* Scroll reveals start hidden and are switched on by an observer.
            Without scripting there is no observer, so show everything. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-ink">
        <Starfield />
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
