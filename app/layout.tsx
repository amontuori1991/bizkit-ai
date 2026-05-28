import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { getMetadataBase } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "BizKit AI | Kit digitali pronti per piccole attivita",
    template: "%s | BizKit AI",
  },
  description:
    "Kit digitali pronti con prompt, template e strumenti operativi per aiutare piccole attivita a crescere con l'AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BizKit AI | Kit digitali pronti per piccole attivita",
    description:
      "Kit digitali pronti con prompt, template e strumenti operativi per aiutare piccole attivita a crescere con l'AI.",
    url: "/",
    siteName: "BizKit AI",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizKit AI | Kit digitali pronti per piccole attivita",
    description:
      "Kit digitali pronti con prompt, template e strumenti operativi per aiutare piccole attivita a crescere con l'AI.",
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
          <AnalyticsProvider />
          <Header />
          <LeadMagnetPopup />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
