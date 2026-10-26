import { type Locale } from "@/lib/i18n";
import { themeBootstrap } from "@/lib/theme";
import "@/app/globals.css";
import "@/app/_components/landing.css";
import "@/app/_components/members.css";
import '@/app/_components/shop.css';
import '@/app/_components/interface.css';
import { Inter } from "next/font/google";
import GoogleAnalytics from "@/app/googleAnalytics";
import Navigation from "./navigation";
import { LandingFooter } from "./ui";
import EventDecoration from '@/decoration';
const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-body",
  display: "swap",
});
export const defaultMetadata = {
  title: "InnoLab — Суралц. Турш. Бүтээ.",
  description:
    "Технологид дуртай залуусын клуб. 3D загварчлал, робот техник, програмчлалын сургалт, бодит төсөл, 3D хэвлэл.",
};
export default function SiteLayout({
  children,
  locale,
  notFound = false,
}: {
  children: React.ReactNode;
  locale: Locale;
  notFound?: boolean;
}) {
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={body.variable}
      style={
        {
          "--font-landing-display": "var(--font-landing-body)",
        } as React.CSSProperties
      }
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <Navigation locale={locale} notFound={notFound} />
        <EventDecoration locale={locale} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <LandingFooter locale={locale} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
