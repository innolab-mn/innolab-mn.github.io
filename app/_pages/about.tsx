import { type Locale, translator, localeHref } from "@/lib/i18n";
import { Action, JoinPanel, PageHeader } from "@/app/_components/ui";
export const metadata = {
  title: "Бидний тухай — InnoLab",
  description:
    "Технологид дуртай, зохион бүтээх хүсэлтэй залуусыг дэмжих InnoLab клубийн түүх, зорилго.",
};
export default function AboutPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <>
      <PageHeader
        label={t("Манай клуб / Бидний тухай")}
        title={t("Сониуч сэтгэл биднийг нэгтгэдэг.")}
        intro={t(
          "Мэдлэгээ хуваалцаж, санааг бодит бүтээл болгоход хамтдаа алхдаг технологийн клуб.",
        )}
        locale={locale}
      />
      <section className="container page-content intro-grid">
        <div>
          <img
            src="/assets/innolab_logo.svg"
            alt="InnoLab — Innovation Laboratory"
            width="500"
            height="400"
            style={{
              width: "100%",
              height: 350,
              objectFit: "contain",
              background: "var(--surface-hover)",
              padding: 45,
              borderRadius: 5,
            }}
          />
        </div>
        <div className="content-prose">
          <h2>{t("Нэг хэвлэгчээс эхэлсэн аялал.")}</h2>
          <p style={{ marginTop: 24 }}>
            {t(
              "Өмнө нь их хэмжээний цаг хугацаа, хөрөнгө шаарддаг байсан төслүүдийг гарын доорх нөөц боломжоор хэрэгжүүлэх үүд нээгдсэн. Энэ боломжид урамшин бид өөрт байсан ганц 3D хэвлэгчээ ашиглаж, хиймэл оюунаар шатар тоглодог робот бүтээх төслөө эхлүүлсэн юм.",
            )}
          </p>
          <p style={{ marginTop: 20 }}>
            {t(
              "Хоббигоо хөгжүүлэх явцад хуримтлуулсан мэдлэг туршлагаа хуваалцах, зохион бүтээх хүсэлтэй залуусыг дэмжих зорилгоор InnoLab-ийг үүсгэн байгууллаа.",
            )}
          </p>
          <div className="actions">
            <Action href="/courses" locale={locale}>
              {t("Сургалт үзэх")}
            </Action>
            <Action href="/activities" secondary locale={locale}>
              {t("Клубт оролцох")}
            </Action>
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">{t("Бидний зорилго")}</p>
            <h2>
              {t("Бүтээх хүсэлд")}
              <br />
              {t("чиг баримжаа өгье.")}
            </h2>
          </div>
          <p>
            {t(
              "Технологид дуртай дүү нартаа өөрсдийн туршлагад үндэслэн чиг баримжаа олгож, зам мөрийг нь гэрэлтүүлэх нь бидний эрхэм зорилго. Сургалт, туршилт, бодит бүтээл — бүгд нэг аяллын хэсэг.",
            )}
          </p>
        </div>
      </section>
      <JoinPanel locale={locale} />
    </>
  );
}
