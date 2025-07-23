import "./globals.css";
import { Inter } from "next/font/google";
import GoogleAnalytics from './googleAnalytics';

export const metadata = {
  title: `InnoLab - Innovation Laboratory`,
  description: `Санаанаас Бодит Биет Хүртэлх Аялал.`,
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <section className="min-h-screen">
          {children}
          <GoogleAnalytics />
        </section>
      </body>
    </html>
  );
}
