import MemberDashboard from "@/app/_components/member-dashboard";
import type { Locale } from "@/lib/i18n";
export const metadata = {
  title: "Гишүүний булан — InnoLab",
  description:
    "Сургалт, төсөл, үйл ажиллагаатай танилцах InnoLab гишүүний булан.",
  robots: { index: false, follow: true },
};
export default function MembersPage({
  locale = "mn",
}: { locale?: Locale } = {}) {
  return <MemberDashboard locale={locale} />;
}
