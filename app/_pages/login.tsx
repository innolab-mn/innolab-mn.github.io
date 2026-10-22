import AuthScreen from "@/app/_components/auth-screen";
import type { Locale } from "@/lib/i18n";
export const metadata = {
  title: "Нэвтрэх — InnoLab",
  description: "InnoLab гишүүний бүртгэлдээ нэвтрээрэй.",
  robots: { index: false, follow: true },
};
export default function LoginPage({ locale = "mn" }: { locale?: Locale } = {}) {
  return <AuthScreen mode="login" locale={locale} />;
}
