import { type Locale, translator, localeHref } from "@/lib/i18n";
import { getAllProjects } from "@/lib/api";
import { ProjectCard } from "@/app/_components/cards";
import { EmptyState, JoinPanel, PageHeader } from "@/app/_components/ui";
export const dynamic = "force-static";
export const metadata = {
  title: "Төслүүд — InnoLab",
  description:
    "Санаанаас бодит бүтээл болсон төслүүд. Архитектурын макет, үзүүлэн, 3D хэвлэлийн бүтээлүүд.",
};
export default async function ProjectsPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  const projects = await getAllProjects(false);
  return (
    <>
      <PageHeader
        label={t("Бүтээх / Төслүүд")}
        title={t("Санаа бодит болсон нь.")}
        intro={t(
          "Архитектурын макет, үзүүлэн, 3D хэвлэлийн бүтээлүүд. Манай төслүүдийн зураг, дэлгэрэнгүйтэй танилцаарай.",
        )}
        locale={locale}
      />
      <section className="container page-content">
        <h2 className="sr-only">{t("Төслийн сан")}</h2>
        {projects.length ? (
          <div className="project-list">
            {projects.map((project: any) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("Төслийн мэдээлэл удахгүй нэмэгдэнэ.")}
            locale={locale}
          />
        )}
      </section>
      <JoinPanel locale={locale} />
    </>
  );
}
