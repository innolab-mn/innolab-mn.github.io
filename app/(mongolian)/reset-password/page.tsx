import * as source from "@/app/_pages/reset-password";
import { translatedMetadata } from "@/lib/i18n";
export const dynamic = "force-static";
export const metadata = translatedMetadata(source.metadata, "mn", "/reset-password");
export default function RoutePage() { return source.default({ locale: "mn" }); }
