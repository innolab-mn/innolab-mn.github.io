import { type Locale, translator, localeHref } from "@/lib/i18n";
import { Action, PageHeader } from "@/app/_components/ui";
export default function NotFound({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <>
      <PageHeader
        label={t("404 / Хуудас олдсонгүй")}
        title={t("Энэ хуудас олдсонгүй.")}
        intro={t(
          "Холбоос өөрчлөгдсөн эсвэл хуудас байхгүй байна. Үндсэн хэсгүүдээс үргэлжлүүлээрэй.",
        )}
        locale={locale}
      />
      <div className="container page-content actions">
        <Action href="/courses" locale={locale}>
          {t("Сургалт үзэх")}
        </Action>
        <Action href="/" secondary locale={locale}>
          {t("Нүүр хуудас")}
        </Action>
      </div>
    </>
  );
}
