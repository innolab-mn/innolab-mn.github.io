import ResetPassword from "@/app/_components/reset-password";
import type { Locale } from "@/lib/i18n";
export const metadata = {
  title: "Шинэ нууц үг — InnoLab",
  description: "Баталгаажуулсан сэргээх холбоосоор шинэ нууц үг тохируулаарай.",
  robots: { index: false, follow: true },
};
export default function ResetPasswordPage({ locale = "mn" }: { locale?: Locale } = {}) {
  return <ResetPassword locale={locale} />;
}
