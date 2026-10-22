import { type Locale, translator, localeHref } from "@/lib/i18n";
import { getAllProjects } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import { Action, PageHeader, TextLink } from "@/app/_components/ui";
import { ProjectCard } from "@/app/_components/cards";
export const dynamic = "force-static";
export const metadata = {
  title: "Үйлчилгээ — InnoLab",
  description:
    "Захиалгат макет, 3D загварчлал, 3D хэвлэл болон технологийн сургалт. Төслийнхөө талаар бидэнтэй ярилцаарай.",
};
export default async function ServicesPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  const projects = await getAllProjects(false);
  return (
    <>
      <PageHeader
        label={t("Хамтран ажиллах / Үйлчилгээ")}
        title={t("Таны санаанд бодит хэлбэр өгье.")}
        intro={t(
          "Захиалгат макет, 3D хэвлэл эсвэл технологийн сургалт хэрэгтэй бол зорилгоо бидэнтэй хуваалцаарай.",
        )}
        locale={locale}
      />
      <section className="container page-content service-grid">
        <div>
          <h2>
            {t("Юу бүтээхийг")}
            <br />
            {t("хүсэж байна вэ?")}
          </h2>
          <p>
            {t(
              "Зураг, загвар, хэмжээс эсвэл санаагаа илгээгээрэй. Ажлын боломж, хугацаа, үнийг хамтдаа тодруулна.",
            )}
          </p>
          <div className="actions">
            <Action href={Facebook_CHAT_URL} external locale={locale}>
              {t("Үйлчилгээ лавлах")}
            </Action>
          </div>
        </div>
        <div className="service-list">
          {[
            [
              "01",
              t("3D загварчлал, хэвлэл"),
              t(
                "Биет загвар, 3D хэвлэсэн эд анги хэрэгтэй зохион бүтээгч, уран бүтээлчдэд. Хэвлэх файл, хэмжээ, зориулалтаа бидэнтэй ярилцаарай.",
              ),
            ],
            [
              "02",
              t("Захиалгат макет, үзүүлэн"),
              t(
                "Барилгын төсөл, архитектурын шийдэл, музейн үзүүлэнг биетээр танилцуулах макет. Масштаб, дэлгэрэнгүй байдлыг төслийн хэрэгцээнд тохируулан ярилцана.",
              ),
            ],
            [
              "03",
              t("Технологийн сургалт"),
              t(
                "Blender, Fusion 360, Python, робот програмчлалын хөтөлбөрүүд. Суралцах зорилгодоо тохирох сургалтаа сонгоорой.",
              ),
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <small>{n}</small>
              <div>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
                {n === "03" && (
                  <TextLink href="/courses" locale={locale}>
                    {t("Хөтөлбөрүүд үзэх")}
                  </TextLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-tint">
        <div className="container">
          <p className="eyebrow">{t("Эхлэхэд хэрэгтэй зүйлс")}</p>
          <h2 style={{ fontSize: 36 }}>{t("Төслөө хамтдаа тодруулъя.")}</h2>
          <div className="learning-path">
            {[
              [
                "01",
                t("Санаа, зориулалт"),
                t("Юу бүтээх, хэнд зориулж ашиглахыг тайлбарлаарай."),
              ],
              [
                "02",
                t("Зураг, хэмжээ"),
                t("Байгаа зураг, файл, хэмжээ, масштабаа хуваалцаарай."),
              ],
              [
                "03",
                t("Хугацаа, нөхцөл"),
                t(
                  "Хүссэн хугацаа, төсвөө ярилцаж ажлын нөхцөлийг тодруулаарай.",
                ),
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {projects.length > 0 && (
        <section className="section container">
          <div className="section-heading">
            <h2>{t("Өмнөх бүтээлүүдээс.")}</h2>
            <TextLink href="/projects" locale={locale}>
              {t("Бүх төсөл")}
            </TextLink>
          </div>
          <div className="project-list">
            {projects.slice(0, 2).map((project: any) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
