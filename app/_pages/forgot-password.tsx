import AuthScreen from "@/app/_components/auth-screen";
import type { Locale } from "@/lib/i18n";
export const metadata = {
  title: "Нууц үг сэргээх — InnoLab",
  description: "Имэйлээр нууц үг сэргээх холбоос аваарай.",
  robots: { index: false, follow: true },
};
export default function ForgotPasswordPage({ locale = "mn" }: { locale?: Locale } = {}) {
  return <AuthScreen mode="forgot" locale={locale} />;
}
