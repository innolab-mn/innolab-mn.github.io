import * as source from "@/app/_pages/project-detail";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export { generateStaticParams } from "@/app/_pages/project-detail";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata(props: Props) {
  const { slug } = await props.params;
  return translatedMetadata(
    await source.generateMetadata(props),
    "mn",
    "/projects/" + slug,
  );
}
export default function RoutePage(props: Props) {
  return source.default({ ...props, locale: "mn" });
}
