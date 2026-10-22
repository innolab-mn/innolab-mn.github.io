import { type Locale, translator, localeHref } from "@/lib/i18n";
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
} from "@/app/_components/ui";
import {
  CourseCard,
  ProjectCard,
  ProductCard,
  NewsRow,
} from "@/app/_components/cards";
export const dynamic = "force-static";
export default async function Home({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
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
              <p className="eyebrow">{t("Технологид дуртай залуусын клуб")}</p>
              <h1>
                {t("Санаагаа")}
                <br />
                <span>{t("бодит бүтээл")}</span>
                <br />
                {t("болгоё.")}
              </h1>
              <p className="hero-intro">
                {t(
                  "3D загварчлал, робот техник, програмчлалыг суралцаж, өөрийн гараар бүтээх орон зай. Мэдлэгээ хуваалцаж, хамтдаа туршиж, хамтдаа урагшилъя.",
                )}
              </p>
              <div className="actions">
                <Action href="/courses" locale={locale}>
                  {t("Сургалт үзэх")}
                </Action>
                <Action href="/projects" secondary locale={locale}>
                  {t("Төслүүд үзэх")}
                </Action>
              </div>
              <p className="hero-footnote">
                <span />
                {t("СУРАЛЦ. ТУРШ. БҮТЭЭ. / INNOLAB")}
              </p>
            </div>
            {hero ? (
              <a
                className="hero-visual"
                href={localeHref(`/projects/${hero.slug}`, locale)}
              >
                <img
                  src={img(firstImage(hero), 1200)}
                  srcSet={`${img(firstImage(hero), 640)} 640w, ${img(firstImage(hero), 1200)} 1200w`}
                  sizes="(max-width:600px) calc(100vw - 40px), 50vw"
                  alt={t(hero.title)}
                  width="1200"
                  height="1000"
                  fetchPriority="high"
                />
                <span className="image-label">{t("САНАА → БОДИТ БҮТЭЭЛ")}</span>
                <div className="hero-caption">
                  <div>
                    <small>{t("МАНАЙ ТӨСЛӨӨС")}</small>
                    <strong>{t(hero.title)}</strong>
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
            <p>{t("БИДНИЙ БҮТЭЭХ ЕРТӨНЦ")}</p>
            <span>
              <b aria-hidden="true">◇</b>
              {t("3D загварчлал")}
            </span>
            <span>
              <b aria-hidden="true">⌘</b>
              {t("Робот техник")}
            </span>
            <span>
              <b aria-hidden="true">&lt;/&gt;</b>
              {t("Програмчлал")}
            </span>
            <span>
              <b aria-hidden="true">⊞</b>
              {t("3D хэвлэл")}
            </span>
          </div>
        </div>
      </section>
      <section id="courses" className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("01 / Суралцах")}</p>
            <h2>{t("Сонирхлоо ур чадвар болго.")}</h2>
            <p>{t("Зөвхөн мэдэх биш, өөрөө хийж сурах хөтөлбөрүүд.")}</p>
          </div>
          <TextLink href="/courses" locale={locale}>
            {t("Бүх сургалт")}
          </TextLink>
        </div>
        {selectedCourses.length ? (
          <div className="course-grid">
            {selectedCourses.map((course: any, index: number) => (
              <CourseCard
                key={course.slug}
                course={course}
                index={index}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <EmptyState locale={locale} />
        )}
        <p className="note">
          {t(
            "Үнэд НӨАТ ороогүй. Хуваарь, сургалтын хэлбэр болон бүртгэлийг бидэнтэй холбогдож тодруулаарай.",
          )}
        </p>
      </section>
      <section id="about" className="section section-tint">
        <div className="container">
          <div className="intro-grid">
            <div>
              <p className="eyebrow">{t("Нэг клуб. Олон боломж.")}</p>
              <h2>
                {t("Сониуч сэтгэлээс")}
                <br />
                {t("шинэ бүтээл төрнө.")}
              </h2>
            </div>
            <div>
              <p>
                {t(
                  "Ганц 3D хэвлэгч, шатар тоглодог робот бүтээх санаанаас бидний аялал эхэлсэн. Өнөөдөр бид хуримтлуулсан мэдлэг, туршлагаа хуваалцаж, зохион бүтээх хүсэлтэй залуусыг дэмждэг.",
                )}
              </p>
              <div className="actions">
                <TextLink href="/about" locale={locale}>
                  {t("Манай клубтэй танилцах")}
                </TextLink>
              </div>
            </div>
          </div>
          <div className="learning-path">
            {[
              [
                "01",
                t("Суралц."),
                t(
                  "3D загварчлал, програмчлал, робот техникийн мэдлэгээ хөгжүүл.",
                ),
              ],
              [
                "02",
                t("Турш."),
                t("Сурсан зүйлээ загвар, код, бодит эд анги дээр туршиж үз."),
              ],
              [
                "03",
                t("Бүтээ."),
                t(
                  "Өөрийн санааг төсөл болгож, дараагийн алхмаа бидэнтэй хамт хий.",
                ),
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n} /</small>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="projects" className="section projects-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("02 / Бүтээх")}</p>
              <h2>{t("Санаа бодит болсон нь.")}</h2>
            </div>
            <TextLink href="/projects" locale={locale}>
              {t("Бүх төсөл")}
            </TextLink>
          </div>
          {selectedProjects.length ? (
            <div className="projects-grid">
              {selectedProjects.map((project: any) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p>{t("Төслийн мэдээлэл удахгүй нэмэгдэнэ.")}</p>
          )}
        </div>
      </section>
      <section id="services" className="section section-white">
        <div className="container service-grid">
          <div>
            <p className="eyebrow">{t("03 / Хамтран ажиллах")}</p>
            <h2>
              {t("Танд санаа байна.")}
              <br />
              {t("Хамтдаа бүтээе.")}
            </h2>
            <p>
              {t(
                "Захиалгат макет, 3D хэвлэл, сургалтын талаар бидэнтэй ярилцаарай.",
              )}
            </p>
            <div className="actions">
              <TextLink href="/services" locale={locale}>
                {t("Үйлчилгээтэй танилцах")}
              </TextLink>
            </div>
          </div>
          <div className="service-list">
            {[
              [
                "01",
                t("3D загварчлал, хэвлэл"),
                t(
                  "Санаагаа биет загвар болгохыг хүссэн зохион бүтээгч, уран бүтээлчдэд.",
                ),
              ],
              [
                "02",
                t("Захиалгат макет"),
                t(
                  "Архитектур, барилгын төсөл, үзүүлэнг биетээр танилцуулахад.",
                ),
              ],
              [
                "03",
                t("Технологийн сургалт"),
                t(
                  "Blender, Fusion 360, Python, робот техникийн мэдлэгээ хөгжүүлэхэд.",
                ),
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(text)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="activities" className="section section-tint">
        <div className="container participate-grid">
          <div>
            <p className="eyebrow">{t("04 / Оролцох")}</p>
            <h2>
              {t("Ганцаараа сонирхохоос")}
              <br />
              {t("хамтдаа бүтээх хүртэл.")}
            </h2>
            <p>
              {t(
                "Клубийн үйл ажиллагаатай танилцаж, өөрт тохирох сургалт болон оролцох боломжийн талаар асуугаарай.",
              )}
            </p>
            <div className="actions">
              <Action href="/activities" locale={locale}>
                {t("Хэрхэн оролцох вэ?")}
              </Action>
            </div>
          </div>
          <div id="blog">
            <p className="eyebrow">{t("Клубийн мэдээ, тэмдэглэл")}</p>
            {posts.slice(0, 2).map((post: any) => (
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
      <section id="store" className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("05 / Бүтээлээ эхлүүлэх")}</p>
            <h2>{t("Дараагийн төсөлд тань.")}</h2>
            <p>{t("Робот гар, мотор, 3D хэвлэсэн эд анги.")}</p>
          </div>
          <TextLink href="/products" locale={locale}>
            {t("Дэлгүүр үзэх")}
          </TextLink>
        </div>
        {selectedProducts.length ? (
          <div className="shop-grid">
            {selectedProducts.map((product: any) => (
              <ProductCard
                key={product.slug}
                product={product}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <EmptyState locale={locale} />
        )}
        <p className="note">
          {t("Үнэд НӨАТ ороогүй. Бэлэн эсэх, захиалгын нөхцөлийг лавлана уу.")}
        </p>
      </section>
      <JoinPanel locale={locale} />
    </>
  );
}
