import * as source from "@/app/_pages/donation";
import { translatedMetadata } from "@/lib/i18n";

export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/donation");

export default function DonationRoute() {
  return source.default({ locale: "mn" });
}
