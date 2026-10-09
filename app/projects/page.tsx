import { getAllProjects } from "@/lib/api";
import { ProjectCard } from "../_components/cards";
import { EmptyState, JoinPanel, PageHeader } from "../_components/ui";
export const dynamic = "force-static";
export const metadata = {
  title: "Төслүүд — InnoLab",
  description:
    "Санаанаас бодит бүтээл болсон төслүүд. Архитектурын макет, үзүүлэн, 3D хэвлэлийн бүтээлүүд.",
};
export default async function ProjectsPage() {
  const projects = await getAllProjects(false);
  return (
    <>
      <PageHeader
        label="Бүтээх / Төслүүд"
        title="Санаа бодит болсон нь."
        intro="Архитектурын макет, үзүүлэн, 3D хэвлэлийн бүтээлүүд. Манай төслүүдийн зураг, дэлгэрэнгүйтэй танилцаарай."
      />
      <section className="container page-content">
        <h2 className="sr-only">Төслийн сан</h2>
        {projects.length ? (
          <div className="project-list">
            {projects.map((project: any) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState title="Төслийн мэдээлэл удахгүй нэмэгдэнэ." />
        )}
      </section>
      <JoinPanel />
    </>
  );
}
