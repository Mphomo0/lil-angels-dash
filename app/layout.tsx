import type { Metadata, Viewport } from "next";
import { Fredoka, IBM_Plex_Sans, Dancing_Script } from "next/font/google";
import { Toaster } from "sonner";
import { DemoBanner } from "@/components/brand/demo-banner";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const script = Dancing_Script({ variable: "--font-script", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: "Lil Angels – Online registration (concept demo)",
  description: "Concept demo of online child registration for Lil Angels Daycare and Aftercare, Tableview.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fffcf1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={`${fredoka.variable} ${plex.variable} ${script.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <DemoBanner />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
