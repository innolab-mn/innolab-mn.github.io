import * as source from "@/app/_pages/services";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/services");
export default function RoutePage() {
  return source.default({ locale: "mn" });
}
