import { type Locale, translator, localeHref } from "@/lib/i18n";
export default function Loading({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <div className="container loading-state" role="status">
      <p className="eyebrow">InnoLab</p>
      <h2>{t("Мэдээлэл ачаалж байна…")}</h2>
      <div className="loading-bar" aria-hidden="true" />
    </div>
  );
}
