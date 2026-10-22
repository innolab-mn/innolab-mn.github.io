import { type Locale, translator, localeHref } from "@/lib/i18n";
import { getAllPosts } from "@/lib/api";
import { Facebook_CHAT_URL, Facebook_URL, Youtube_URL } from "@/lib/constants";
import { Action, PageHeader, TextLink } from "@/app/_components/ui";
import { NewsRow } from "@/app/_components/cards";
export const dynamic = "force-static";
export const metadata = {
  title: "Үйл ажиллагаа, оролцох боломж — InnoLab",
  description:
    "Клубтэй танилцаж, сургалт болон хамтран бүтээх боломжийн талаар мэдээлэл аваарай.",
};
export default async function ActivitiesPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  const posts = await getAllPosts(false);
  return (
    <>
      <PageHeader
        label={t("Манай клуб / Оролцох")}
        title={t("Хамтдаа суралцаж, хамтдаа бүтээе.")}
        intro={t(
          "Технологи сонирхдог бол эхний алхмаа хийгээрэй. Сургалт сонгох, бүтээлийн санаагаа ярилцах, туршлага судлах боломжууд энд бий.",
        )}
        locale={locale}
      />
      <section className="container page-content">
        <div className="learning-path" style={{ marginTop: 0 }}>
          <article>
            <small>{t("01 / СУРАЛЦАХ")}</small>
            <h3>{t("Хөтөлбөрөө сонгох")}</h3>
            <p>
              {t(
                "Өөрийн сонирхолд тохирох 3D загварчлал, програмчлал, робот техникийн сургалттай танилцаарай.",
              )}
            </p>
            <TextLink href="/courses" locale={locale}>
              {t("Сургалт үзэх")}
            </TextLink>
          </article>
          <article>
            <small>{t("02 / ХОЛБОГДОХ")}</small>
            <h3>{t("Санаагаа хуваалцах")}</h3>
            <p>
              {t(
                "Клубийн үйл ажиллагаанд оролцох, хамтран бүтээх сонирхлоо бидэнд хэлээрэй.",
              )}
            </p>
            <TextLink href="/contact" locale={locale}>
              {t("Холбогдох")}
            </TextLink>
          </article>
          <article>
            <small>{t("03 / ТУРШЛАГА СУДЛАХ")}</small>
            <h3>{t("Бүтээл, хичээл үзэх")}</h3>
            <p>
              {t(
                "Манай YouTube сувгаар технологи, бүтээлийн талаарх агуулгатай танилцаарай.",
              )}
            </p>
            <TextLink href={Youtube_URL} locale={locale}>
              {t("YouTube суваг")}
            </TextLink>
          </article>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container participate-grid">
          <div>
            <p className="eyebrow">{t("Дараагийн үйл ажиллагаа")}</p>
            <h2>
              {t("Оролцох боломжоо")}
              <br />
              {t("тодруулаарай.")}
            </h2>
            <p>
              {t(
                "Энд баталгаажсан дараагийн арга хэмжээний хуваарь хараахан нийтлэгдээгүй байна. Огноо, байршил, оролцох нөхцөлийг биднээс асуугаарай.",
              )}
            </p>
            <div className="actions">
              <Action href={Facebook_CHAT_URL} external locale={locale}>
                {t("Оролцох талаар асуух")}
              </Action>
              <TextLink href={Facebook_URL} locale={locale}>
                {t("Facebook мэдээ")}
              </TextLink>
            </div>
          </div>
          <div>
            <p className="eyebrow">{t("Клубийн мэдээ, тэмдэглэл")}</p>
            {posts.slice(0, 3).map((post: any) => (
              <NewsRow key={post.slug} post={post} locale={locale} />
            ))}
            <div className="actions">
              <TextLink href="/posts" locale={locale}>
                {t("Бүх мэдээ")}
              </TextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
