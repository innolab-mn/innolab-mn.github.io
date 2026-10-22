import SiteLayout, { defaultMetadata } from "@/app/_components/site-layout";
export const metadata = defaultMetadata;
export default function MongolianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout locale="mn">{children}</SiteLayout>;
}
