import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { getMetadataBase } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "BizKit AI | AI Marketing Platform for Local Businesses",
    template: "%s | BizKit AI",
  },
  description:
    "BizKit AI e l'AI Marketing Platform for Local Businesses: contenuti, promo, CRM leggero e planning per attivita locali.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "BizKit AI | AI Marketing Platform for Local Businesses",
    description:
      "BizKit AI e l'AI Marketing Platform for Local Businesses: contenuti, promo, CRM leggero e planning per attivita locali.",
    url: "/",
    siteName: "BizKit AI",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "BizKit AI logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BizKit AI | AI Marketing Platform for Local Businesses",
    description:
      "BizKit AI e l'AI Marketing Platform for Local Businesses: contenuti, promo, CRM leggero e planning per attivita locali.",
    images: ["/favicon/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-hero" />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
          >
            Vai al contenuto principale
          </a>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <Header />
          <LeadMagnetPopup />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
