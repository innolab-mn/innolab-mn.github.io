"use client";
import { type Locale, translator, localeHref } from "@/lib/i18n";

export default function ErrorPage({
  reset,
  locale = "mn",
}: {
  error: Error;
  reset: () => void;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <section className="container loading-state">
      <p className="eyebrow">{t("Мэдээлэл ачаалсангүй")}</p>
      <h1>{t("Дахин оролдоно уу.")}</h1>
      <p className="muted" style={{ marginTop: 20 }}>
        {t("Хуудсыг ачаалахад алдаа гарлаа. Түр хүлээгээд дахин оролдоорой.")}
      </p>
      <div className="actions">
        <button className="button" onClick={reset}>
          {t("Дахин оролдох")}
        </button>
        <a
          className="button button-outline"
          href={localeHref("/contact", locale)}
        >
          {t("Холбогдох")}
        </a>
      </div>
    </section>
  );
}
