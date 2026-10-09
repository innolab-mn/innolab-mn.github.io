import {
  getAllCourses,
  getAllPosts,
  getAllProducts,
  getAllProjects,
} from "@/lib/api";
import {
  Action,
  ArrowUpRight,
  EmptyState,
  firstImage,
  img,
  JoinPanel,
  TextLink,
} from "./_components/ui";
import {
  CourseCard,
  ProjectCard,
  ProductCard,
  NewsRow,
} from "./_components/cards";
export const dynamic = "force-static";
export default async function Home() {
  const [courses, projects, products, posts] = await Promise.all([
    getAllCourses(false),
    getAllProjects(false),
    getAllProducts(false),
    getAllPosts(false),
  ]);
  const hero =
    projects.find(
      (p: any) =>
        p.slug === "world-space-week-lunar-habitation-foster-and-partners",
    ) || projects.find((p: any) => firstImage(p));
  const featuredCourses = [
    courses.find((c: any) => /сурагч/.test(c.title)),
    courses.find((c: any) => /робот/i.test(c.title)),
    courses.find((c: any) => /python/i.test(c.title)),
  ].filter(Boolean);
  const selectedCourses = featuredCourses.length
    ? featuredCourses
    : courses.slice(0, 3);
  const selectedProjects = projects
    .filter((p: any) => firstImage(p))
    .slice(0, 2);
  const selectedProducts = products.filter((p: any) => p.price > 0).slice(0, 3);
  return (
    <>
      <section id="top" className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Технологид дуртай залуусын клуб</p>
              <h1>
                Санаагаа
                <br />
                <span>бодит бүтээл</span>
                <br />
                болгоё.
              </h1>
              <p className="hero-intro">
                3D загварчлал, робот техник, програмчлалыг суралцаж, өөрийн
                гараар бүтээх орон зай. Мэдлэгээ хуваалцаж, хамтдаа туршиж,
                хамтдаа урагшилъя.
              </p>
              <div className="actions">
                <Action href="/courses">Сургалт үзэх</Action>
                <Action href="/projects" secondary>
                  Төслүүд үзэх
                </Action>
              </div>
              <p className="hero-footnote">
                <span />
                СУРАЛЦ. ТУРШ. БҮТЭЭ. / INNOLAB
              </p>
            </div>
            {hero ? (
              <a className="hero-visual" href={`/projects/${hero.slug}`}>
                <img
                  src={img(firstImage(hero), 1200)}
                  srcSet={`${img(firstImage(hero), 640)} 640w, ${img(firstImage(hero), 1200)} 1200w`}
                  sizes="(max-width:600px) calc(100vw - 40px), 50vw"
                  alt={hero.title}
                  width="1200"
                  height="1000"
                  fetchPriority="high"
                />
                <span className="image-label">САНАА → БОДИТ БҮТЭЭЛ</span>
                <div className="hero-caption">
                  <div>
                    <small>МАНАЙ ТӨСЛӨӨС</small>
                    <strong>{hero.title}</strong>
                  </div>
                  <span className="round-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </a>
            ) : (
              <div className="hero-visual" style={{ padding: 60 }}>
                <img src="/assets/innolab_logo.svg" alt="InnoLab" />
              </div>
            )}
          </div>
          <div className="discipline-strip">
            <p>БИДНИЙ БҮТЭЭХ ЕРТӨНЦ</p>
            <span>
              <b aria-hidden="true">◇</b>3D загварчлал
            </span>
            <span>
              <b aria-hidden="true">⌘</b>Робот техник
            </span>
            <span>
              <b aria-hidden="true">&lt;/&gt;</b>Програмчлал
            </span>
            <span>
              <b aria-hidden="true">⊞</b>3D хэвлэл
            </span>
          </div>
        </div>
      </section>
      <section id="courses" className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Суралцах</p>
            <h2>Сонирхлоо ур чадвар болго.</h2>
            <p>Зөвхөн мэдэх биш, өөрөө хийж сурах хөтөлбөрүүд.</p>
          </div>
          <TextLink href="/courses">Бүх сургалт</TextLink>
        </div>
        {selectedCourses.length ? (
          <div className="course-grid">
            {selectedCourses.map((course: any, index: number) => (
              <CourseCard key={course.slug} course={course} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        <p className="note">
          Үнэд НӨАТ ороогүй. Хуваарь, сургалтын хэлбэр болон бүртгэлийг бидэнтэй
          холбогдож тодруулаарай.
        </p>
      </section>
      <section id="about" className="section section-tint">
        <div className="container">
          <div className="intro-grid">
            <div>
              <p className="eyebrow">Нэг клуб. Олон боломж.</p>
              <h2>
                Сониуч сэтгэлээс
                <br />
                шинэ бүтээл төрнө.
              </h2>
            </div>
            <div>
              <p>
                Ганц 3D хэвлэгч, шатар тоглодог робот бүтээх санаанаас бидний
                аялал эхэлсэн. Өнөөдөр бид хуримтлуулсан мэдлэг, туршлагаа
                хуваалцаж, зохион бүтээх хүсэлтэй залуусыг дэмждэг.
              </p>
              <div className="actions">
                <TextLink href="/about">Манай клубтэй танилцах</TextLink>
              </div>
            </div>
          </div>
          <div className="learning-path">
            {[
              [
                "01",
                "Суралц.",
                "3D загварчлал, програмчлал, робот техникийн мэдлэгээ хөгжүүл.",
              ],
              [
                "02",
                "Турш.",
                "Сурсан зүйлээ загвар, код, бодит эд анги дээр туршиж үз.",
              ],
              [
                "03",
                "Бүтээ.",
                "Өөрийн санааг төсөл болгож, дараагийн алхмаа бидэнтэй хамт хий.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n} /</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="projects" className="section projects-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / Бүтээх</p>
              <h2>Санаа бодит болсон нь.</h2>
            </div>
            <TextLink href="/projects">Бүх төсөл</TextLink>
          </div>
          {selectedProjects.length ? (
            <div className="projects-grid">
              {selectedProjects.map((project: any) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <p>Төслийн мэдээлэл удахгүй нэмэгдэнэ.</p>
          )}
        </div>
      </section>
      <section id="services" className="section section-white">
        <div className="container service-grid">
          <div>
            <p className="eyebrow">03 / Хамтран ажиллах</p>
            <h2>
              Танд санаа байна.
              <br />
              Хамтдаа бүтээе.
            </h2>
            <p>
              Захиалгат макет, 3D хэвлэл, сургалтын талаар бидэнтэй ярилцаарай.
            </p>
            <div className="actions">
              <TextLink href="/services">Үйлчилгээтэй танилцах</TextLink>
            </div>
          </div>
          <div className="service-list">
            {[
              [
                "01",
                "3D загварчлал, хэвлэл",
                "Санаагаа биет загвар болгохыг хүссэн зохион бүтээгч, уран бүтээлчдэд.",
              ],
              [
                "02",
                "Захиалгат макет",
                "Архитектур, барилгын төсөл, үзүүлэнг биетээр танилцуулахад.",
              ],
              [
                "03",
                "Технологийн сургалт",
                "Blender, Fusion 360, Python, робот техникийн мэдлэгээ хөгжүүлэхэд.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="activities" className="section section-tint">
        <div className="container participate-grid">
          <div>
            <p className="eyebrow">04 / Оролцох</p>
            <h2>
              Ганцаараа сонирхохоос
              <br />
              хамтдаа бүтээх хүртэл.
            </h2>
            <p>
              Клубийн үйл ажиллагаатай танилцаж, өөрт тохирох сургалт болон
              оролцох боломжийн талаар асуугаарай.
            </p>
            <div className="actions">
              <Action href="/activities">Хэрхэн оролцох вэ?</Action>
            </div>
          </div>
          <div id="blog">
            <p className="eyebrow">Клубийн мэдээ, тэмдэглэл</p>
            {posts.slice(0, 2).map((post: any) => (
              <NewsRow key={post.slug} post={post} />
            ))}
            <div className="actions">
              <TextLink href="/posts">Бүх мэдээ</TextLink>
            </div>
          </div>
        </div>
      </section>
      <section id="store" className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">05 / Бүтээлээ эхлүүлэх</p>
            <h2>Дараагийн төсөлд тань.</h2>
            <p>Робот гар, мотор, 3D хэвлэсэн эд анги.</p>
          </div>
          <TextLink href="/products">Дэлгүүр үзэх</TextLink>
        </div>
        {selectedProducts.length ? (
          <div className="shop-grid">
            {selectedProducts.map((product: any) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        <p className="note">
          Үнэд НӨАТ ороогүй. Бэлэн эсэх, захиалгын нөхцөлийг лавлана уу.
        </p>
      </section>
      <JoinPanel />
    </>
  );
}
