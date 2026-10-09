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
type Props = { params: Promise<{ slug: string }> };
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
export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const images = (project.imageCollection?.items ?? []).filter(
    (i: any) => i?.url,
  );
  return (
    <>
      <PageHeader
        label="Төсөл / Бодит бүтээл"
        title={project.title}
        back={{ href: "/projects", label: "Бүх төсөл" }}
      />
      <div className="container page-content">
        <div className="detail-grid">
          <article>
            {firstImage(project) && (
              <img
                className="detail-image"
                src={img(firstImage(project), 1400)}
                alt={project.title}
                width="1400"
                height="900"
              />
            )}
            <div className="content-prose">
              <RichContent content={project.content} />
            </div>
          </article>
          <aside className="detail-aside">
            <p className="eyebrow">Төслийн тухай</p>
            <h2>Танд ийм санаа байна уу?</h2>
            {project.clientName && (
              <dl className="facts">
                <div>
                  <dt>Захиалагч</dt>
                  <dd>{project.clientName}</dd>
                </div>
              </dl>
            )}
            <p>
              Хийхийг хүссэн бүтээл, загварынхаа талаар ярилцаж, боломжит
              шийдлийг хамтдаа тодруулъя.
            </p>
            <Action href={Facebook_CHAT_URL} external>
              Төслөө ярилцах
            </Action>
            <Action href="/services" secondary>
              Үйлчилгээ үзэх
            </Action>
          </aside>
        </div>
        {images.length > 1 && (
          <section aria-label="Төслийн зургууд" className="gallery-grid">
            {images.slice(1).map((image: any, index: number) => (
              <figure key={image.url}>
                <img
                  src={img(image.url, 1000)}
                  alt={`${project.title} — зураг ${index + 2}`}
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
          <TextLink href="/projects">Бүх төсөл рүү буцах</TextLink>
        </div>
      </div>
    </>
  );
}
