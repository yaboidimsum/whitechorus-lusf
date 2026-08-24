import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Nunito_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AudioProvider } from "@/hooks/use-audio-player";
import MusicPlayer from "@/components/audio/MusicPlayer";
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
  title: "White Chorus — L.U.F.S. Dress Up",
  description:
    "Dress Emir and Friska for the dance floor and save your looks. A White Chorus L.U.F.S. experience.",
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
        <AudioProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-coral focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-plum-deep"
          >
            Skip to content
          </a>
          {/* Blurred L.U.F.S. cover backdrop + plum wash for legibility.
              Fixed and -z-10 so in-flow content paints above it. Decorative, so
              pointer-events are disabled (ui-polish). */}
          <div
            aria-hidden
            className="pointer-events-none fixed -inset-6 -z-10 bg-[url('/assets/lufs/background/lufs-cover-sm.jpg')] bg-cover bg-center blur-[6px]"
          />
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-plum-deep/70" />
          {children}
          <footer className="border-t border-cream/10 bg-plum pb-[env(safe-area-inset-bottom)]">
            <p className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-cream/70">
              © 2026 White Chorus. All rights reserved.
            </p>
          </footer>
          
          {/* Floating Electropop BGM Music Player */}
          <MusicPlayer />

          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: { background: "#3b2d38", border: "1px solid rgba(245,231,228,0.15)", color: "#f5e7e4" },
            }}
          />
        </AudioProvider>
      </body>
    </html>
  );
}
