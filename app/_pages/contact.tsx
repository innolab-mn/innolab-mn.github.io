import { type Locale, translator, localeHref } from "@/lib/i18n";
import { Facebook_CHAT_URL, Facebook_URL, Youtube_URL } from "@/lib/constants";
import {
  Action,
  MODULUS_URL,
  PageHeader,
  PHONE,
  TextLink,
} from "@/app/_components/ui";
export const metadata = {
  title: "Холбогдох, клубт оролцох — InnoLab",
  description:
    "Сургалт, захиалгат макет, 3D хэвлэл, клубийн үйл ажиллагааны талаар холбогдоорой. Утас: 86001161.",
};
export default function ContactPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <>
      <PageHeader
        label={t("Дараагийн алхам / Холбогдох")}
        title={t("Таны санааг сонсоё.")}
        intro={t(
          "Сургалт сонгох, клубийн үйл ажиллагаанд оролцох, үйлчилгээ эсвэл бүтээгдэхүүний талаар асуух зүйл байвал бидэнтэй холбогдоорой.",
        )}
        locale={locale}
      />
      <section className="container contact-grid page-content">
        <div>
          <div className="detail-summary">
            <h2>{t("Юунаас эхлэхээ мэдэхгүй байна уу?")}</h2>
            <p className="muted">
              {t(
                "Юу сонирхдог, юу хийж сурахыг хүсэж байгаагаа хэлээрэй. Тохирох дараагийн алхмаа хамтдаа ярилцъя.",
              )}
            </p>
            <div className="actions">
              <Action href={Facebook_CHAT_URL} external locale={locale}>
                {t("Messenger-ээр бичих")}
              </Action>
            </div>
          </div>
          <div className="contact-item">
            <h2>{t("Үйлчилгээний хүсэлт")}</h2>
            <p>
              {t(
                "Санаа, зориулалт, хэмжээ, байгаа зураг эсвэл файлаа Messenger-ээр илгээгээрэй.",
              )}
            </p>
            <TextLink href="/services" locale={locale}>
              {t("Үйлчилгээтэй танилцах")}
            </TextLink>
          </div>
          <div className="contact-item">
            <h2>{t("Сургалт, клубт оролцох")}</h2>
            <p>
              {t(
                "Сонирхож буй хөтөлбөр, өөрийн түвшин, боломжтой цагаа бидэнд хэлээрэй.",
              )}
            </p>
            <TextLink href="/courses" locale={locale}>
              {t("Хөтөлбөрүүд үзэх")}
            </TextLink>
          </div>
        </div>
        <div>
          <div className="contact-item">
            <h2>{t("Утас")}</h2>
            <a
              className="text-link"
              href={localeHref(`tel:+976${PHONE}`, locale)}
            >
              +976 {PHONE}
            </a>
          </div>
          <div className="contact-item">
            <h2>{t("Хаяг")}</h2>
            <address>
              {t("Сүхбаатар дүүрэг, M Building #601")}
              <br />
              {t("Улаанбаатар, Монгол")}
            </address>
            <p className="note">{t("Ирэхээсээ өмнө утсаар холбогдоорой.")}</p>
          </div>
          <div className="contact-item">
            <h2>{t("Биднийг дагаарай")}</h2>
            <div className="actions" style={{ marginTop: 10 }}>
              <TextLink href={Facebook_URL} locale={locale}>
                Facebook
              </TextLink>
              <TextLink href={Youtube_URL} locale={locale}>
                YouTube
              </TextLink>
            </div>
          </div>
          <div className="contact-item">
            <h2>{t("Төслийн бусад бүтээл")}</h2>
            <TextLink href={MODULUS_URL} locale={locale}>
              Modulus
            </TextLink>
          </div>
        </div>
      </section>
    </>
  );
}
