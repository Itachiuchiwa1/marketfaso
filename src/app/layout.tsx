import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketFaso — Plateforme e-commerce & livraisons au Burkina Faso",
  description: "Achetez et vendez des produits à Ouagadougou, Bobo-Dioulasso et partout au Burkina Faso. Paiement Mobile Money et livraison rapide par moto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)] antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
