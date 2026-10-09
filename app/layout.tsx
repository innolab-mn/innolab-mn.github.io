import "./globals.css";
import "./_components/landing.css";
import { Inter } from "next/font/google";
import GoogleAnalytics from "./googleAnalytics";
import Navigation from "./_components/navigation";
import { LandingFooter } from "./_components/ui";
const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-body",
  display: "swap",
});
export const metadata = {
  title: "InnoLab — Суралц. Турш. Бүтээ.",
  description:
    "Технологид дуртай залуусын клуб. 3D загварчлал, робот техник, програмчлалын сургалт, бодит төсөл, 3D хэвлэл.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="mn"
      className={body.variable}
      style={
        {
          "--font-landing-display": "var(--font-landing-body)",
        } as React.CSSProperties
      }
    >
      <body>
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <LandingFooter />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
