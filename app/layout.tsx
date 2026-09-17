import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  Space_Grotesk,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Ish Times",
  description: "A personal daily newspaper, prepared for Ish B. Shukla.",
};

export const viewport: Viewport = {
  // Newsprint doesn't have a dark mode — tell browsers (esp. Android
  // Chrome's "auto-dark for websites") not to auto-invert this page.
  colorScheme: "only light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${spaceGrotesk.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="h-dvh flex flex-col overflow-hidden bg-[#f4f1ea] text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}
