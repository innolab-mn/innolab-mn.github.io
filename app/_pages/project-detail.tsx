import { type Locale, translator, localeHref } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import {
  Action,
  firstImage,
  img,
  PageHeader,
  TextLink,
} from "@/app/_components/ui";
import RichContent from "@/app/_components/rich-content";
export const dynamic = "force-static";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export async function generateStaticParams() {
  return (await getAllProjects(false)).map((p: any) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project
      ? `${project.title} — InnoLab төсөл`
      : "Төсөл олдсонгүй — InnoLab",
    openGraph: project
      ? {
          title: project.title,
          images: firstImage(project)
            ? [{ url: img(firstImage(project), 1200) }]
            : undefined,
        }
      : undefined,
  };
}
export default async function ProjectDetail({
  params,
  locale = "mn",
}: Props & {
  locale?: Locale;
}) {
  const t = translator(locale);
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const images = (project.imageCollection?.items ?? []).filter(
    (i: any) => i?.url,
  );
  return (
    <>
      <PageHeader
        label={t("Төсөл / Бодит бүтээл")}
        title={project.title}
        back={{ href: "/projects", label: t("Бүх төсөл") }}
        locale={locale}
      />
      <div className="container page-content">
        <div className="detail-grid">
          <article>
            {firstImage(project) && (
              <img
                className="detail-image"
                src={img(firstImage(project), 1400)}
                alt={t(project.title)}
                width="1400"
                height="900"
              />
            )}
            <div className="content-prose">
              <RichContent content={project.content} locale={locale} />
            </div>
          </article>
          <aside className="detail-aside">
            <p className="eyebrow">{t("Төслийн тухай")}</p>
            <h2>{t("Танд ийм санаа байна уу?")}</h2>
            {project.clientName && (
              <dl className="facts">
                <div>
                  <dt>{t("Захиалагч")}</dt>
                  <dd>{t(project.clientName)}</dd>
                </div>
              </dl>
            )}
            <p>
              {t(
                "Хийхийг хүссэн бүтээл, загварынхаа талаар ярилцаж, боломжит шийдлийг хамтдаа тодруулъя.",
              )}
            </p>
            <Action href={Facebook_CHAT_URL} external locale={locale}>
              {t("Төслөө ярилцах")}
            </Action>
            <Action href="/services" secondary locale={locale}>
              {t("Үйлчилгээ үзэх")}
            </Action>
          </aside>
        </div>
        {images.length > 1 && (
          <section aria-label={t("Төслийн зургууд")} className="gallery-grid">
            {images.slice(1).map((image: any, index: number) => (
              <figure key={image.url}>
                <img
                  src={img(image.url, 1000)}
                  alt={`${t(project.title)} — ${locale === "en" ? "image" : "зураг"} ${index + 2}`}
                  loading="lazy"
                  width="1000"
                  height="750"
                  style={{ height: "auto" }}
                />
              </figure>
            ))}
          </section>
        )}
        <div className="actions">
          <TextLink href="/projects" locale={locale}>
            {t("Бүх төсөл рүү буцах")}
          </TextLink>
        </div>
      </div>
    </>
  );
}
