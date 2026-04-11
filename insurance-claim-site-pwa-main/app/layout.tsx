import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree, Roboto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { DevModeSwitcherLoader } from "@/components/dev-mode-switcher-loader";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-display-serif",
  weight: ["200", "300", "400"],
});

export const metadata: Metadata = {
  title: "Insurance Claim Help UK",
  description:
    "Web-based platform for homeowners and property professionals to capture damage, generate AI-driven 3D models, and manage insurance-ready repair estimates.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClaimHelp UK",
  },
};

export const viewport: Viewport = {
  themeColor: "#003153",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${robotoSerif.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <DevModeSwitcherLoader />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
