import * as source from "@/app/_pages/products";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/products");
export default function RoutePage() {
  return source.default({ locale: "mn" });
}
