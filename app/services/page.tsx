import { getAllProjects } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import { Action, PageHeader, TextLink } from "../_components/ui";
import { ProjectCard } from "../_components/cards";
export const dynamic = "force-static";
export const metadata = {
  title: "Үйлчилгээ — InnoLab",
  description:
    "Захиалгат макет, 3D загварчлал, 3D хэвлэл болон технологийн сургалт. Төслийнхөө талаар бидэнтэй ярилцаарай.",
};
export default async function ServicesPage() {
  const projects = await getAllProjects(false);
  return (
    <>
      <PageHeader
        label="Хамтран ажиллах / Үйлчилгээ"
        title="Таны санаанд бодит хэлбэр өгье."
        intro="Захиалгат макет, 3D хэвлэл эсвэл технологийн сургалт хэрэгтэй бол зорилгоо бидэнтэй хуваалцаарай."
      />
      <section className="container page-content service-grid">
        <div>
          <h2>
            Юу бүтээхийг
            <br />
            хүсэж байна вэ?
          </h2>
          <p>
            Зураг, загвар, хэмжээс эсвэл санаагаа илгээгээрэй. Ажлын боломж,
            хугацаа, үнийг хамтдаа тодруулна.
          </p>
          <div className="actions">
            <Action href={Facebook_CHAT_URL} external>
              Үйлчилгээ лавлах
            </Action>
          </div>
        </div>
        <div className="service-list">
          {[
            [
              "01",
              "3D загварчлал, хэвлэл",
              "Биет загвар, 3D хэвлэсэн эд анги хэрэгтэй зохион бүтээгч, уран бүтээлчдэд. Хэвлэх файл, хэмжээ, зориулалтаа бидэнтэй ярилцаарай.",
            ],
            [
              "02",
              "Захиалгат макет, үзүүлэн",
              "Барилгын төсөл, архитектурын шийдэл, музейн үзүүлэнг биетээр танилцуулах макет. Масштаб, дэлгэрэнгүй байдлыг төслийн хэрэгцээнд тохируулан ярилцана.",
            ],
            [
              "03",
              "Технологийн сургалт",
              "Blender, Fusion 360, Python, робот програмчлалын хөтөлбөрүүд. Суралцах зорилгодоо тохирох сургалтаа сонгоорой.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <small>{n}</small>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                {n === "03" && (
                  <TextLink href="/courses">Хөтөлбөрүүд үзэх</TextLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-tint">
        <div className="container">
          <p className="eyebrow">Эхлэхэд хэрэгтэй зүйлс</p>
          <h2 style={{ fontSize: 36 }}>Төслөө хамтдаа тодруулъя.</h2>
          <div className="learning-path">
            {[
              [
                "01",
                "Санаа, зориулалт",
                "Юу бүтээх, хэнд зориулж ашиглахыг тайлбарлаарай.",
              ],
              [
                "02",
                "Зураг, хэмжээ",
                "Байгаа зураг, файл, хэмжээ, масштабаа хуваалцаарай.",
              ],
              [
                "03",
                "Хугацаа, нөхцөл",
                "Хүссэн хугацаа, төсвөө ярилцаж ажлын нөхцөлийг тодруулаарай.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {projects.length > 0 && (
        <section className="section container">
          <div className="section-heading">
            <h2>Өмнөх бүтээлүүдээс.</h2>
            <TextLink href="/projects">Бүх төсөл</TextLink>
          </div>
          <div className="project-list">
            {projects.slice(0, 2).map((project: any) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
