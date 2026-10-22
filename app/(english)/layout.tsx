import SiteLayout, { defaultMetadata } from "@/app/_components/site-layout";
import { translatedMetadata } from "@/lib/i18n";
export const metadata = translatedMetadata(defaultMetadata, "en", "/");
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
