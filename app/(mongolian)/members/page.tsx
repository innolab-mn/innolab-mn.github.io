import * as source from "@/app/_pages/members";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/members");
export default function RoutePage() {
  return source.default({ locale: "mn" });
}
