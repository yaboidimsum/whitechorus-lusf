import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Nunito_Sans } from "next/font/google";
import "./globals.css";

// Module-level font config — loaded once, preloaded by Next (rule `server-hoist-static-io`).
// Bebas Neue = condensed poster/display; Nunito Sans = friendly interface body.
const bebas = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito_Sans({
  variable: "--font-body",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "White Chorus — L.U.S.F. Dress Up",
  description:
    "Dress Emir and Friska for the dance floor and save your looks. A White Chorus L.U.S.F. experience.",
};

export const viewport: Viewport = {
  themeColor: "#241a25",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-coral focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-plum-deep"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
