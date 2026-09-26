import "./globals.css";
import "./_components/landing.css";
import { Geist, Inter, Playfair_Display } from "next/font/google";
import GoogleAnalytics from './googleAnalytics';

export const metadata = {
  title: `InnoLab - Innovation Laboratory`,
  description: `Санаанаас Бодит Биет Хүртэлх Аялал.`,
};

const display = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-landing-display", display: "swap" });
const body = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-landing-body", display: "swap" });
const serif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  variable: "--font-landing-serif",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body className="font-[family-name:var(--font-landing-body)] bg-[#FBFAF7] text-[#12281A] antialiased selection:bg-[#42A85D] selection:text-black">
        <noscript>
          <style>{`[data-reveal],[data-panel-img],.word-reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
