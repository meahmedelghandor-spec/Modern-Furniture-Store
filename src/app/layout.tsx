import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteMotion from "@/components/SiteMotion";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { getSiteContent } from "@/lib/site-content";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export async function generateMetadata(): Promise<Metadata> {
  const { global } = await getSiteContent();
  return {
    title: `${global.siteName} | اسكرو الأثاث المستعمل`,
    description: "نشتري أثاثك المستعمل بأفضل سعر. سهل وسريع وموثوق.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased">
        <AuthProvider>
          <SiteContentProvider content={siteContent}>
            <Navbar />
            <main className="flex-1 flex flex-col">
              <SiteMotion>{children}</SiteMotion>
            </main>
            <Footer />
          </SiteContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
