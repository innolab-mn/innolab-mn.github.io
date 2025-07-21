import "../globals.css";
import { Inter } from "next/font/google";
import {Header, Footer} from "../header_footer";


export const metadata = {
  title: `InnoLab - Innovation Laboratory`,
  description: `Санаанаас Бодит Биет Хүртэлх Аялал.`,
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <section className="min-h-screen">
          <Header />
          <main>{children}</main>
          <Footer />
        </section>
      </body>
    </html>
  );
}
