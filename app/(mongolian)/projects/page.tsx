import * as source from "@/app/_pages/projects";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/projects");
export default function RoutePage() {
  return source.default({ locale: "mn" });
}
