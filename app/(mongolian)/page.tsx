import * as source from "@/app/_pages/home";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(undefined, "mn", "/");
export default function RoutePage() {
  return source.default({ locale: "mn" });
}
