import AuthScreen from "@/app/_components/auth-screen";
import type { Locale } from "@/lib/i18n";
export const metadata = {
  title: "Бүртгүүлэх — InnoLab",
  description: "InnoLab-ийн гишүүний бүртгэл үүсгэх маягт.",
  robots: { index: false, follow: true },
};
export default function RegisterPage({
  locale = "mn",
}: { locale?: Locale } = {}) {
  return <AuthScreen mode="register" locale={locale} />;
}
