import { notFound } from "next/navigation";
import { getAllCourses, getCourseAndMoreCourses } from "@/lib/api";
import { courseInfo } from "@/lib/course-info";
import { Facebook_CHAT_URL } from "@/lib/constants";
import {
  Action,
  firstImage,
  img,
  PageHeader,
  PHONE,
  Price,
  TextLink,
} from "@/app/_components/ui";
import RichContent from "@/app/_components/rich-content";
import { CourseCard } from "@/app/_components/cards";
export const dynamic = "force-static";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return (await getAllCourses(false)).map((c: any) => ({ slug: c.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { course } = await getCourseAndMoreCourses(slug, false);
  return {
    title: course ? `${course.title} — InnoLab` : "Сургалт олдсонгүй — InnoLab",
  };
}
export default async function CourseDetail({ params }: Props) {
  const { slug } = await params;
  const { course, moreCourses } = await getCourseAndMoreCourses(slug, false);
  if (!course) notFound();
  const info = courseInfo(course);
  return (
    <>
      <PageHeader
        label={info.category}
        title={info.title}
        intro={info.summary}
        back={{ href: "/courses", label: "Бүх сургалт" }}
        actions={
          <>
            <Action href="#enroll">Бүртгэлийн мэдээлэл</Action>
            <Price price={course.price} originalPrice={course.originalPrice} />
          </>
        }
      />
      <div className="container detail-grid page-content">
        <article>
          {firstImage(course) && (
            <img
              className="detail-image"
              src={img(firstImage(course), 1200)}
              alt={course.title}
              width="1200"
              height="700"
              style={
                /робот/i.test(info.category)
                  ? { objectFit: "contain", background: "white" }
                  : undefined
              }
            />
          )}
          {info.outcomes.length > 0 && (
            <section className="detail-summary">
              <h2>Та юу хийж сурах вэ?</h2>
              <ul>
                {info.outcomes.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          )}
          <div className="content-prose">
            <RichContent content={course.content} />
          </div>
        </article>
        <aside className="detail-aside" id="enroll">
          <p className="eyebrow">Сургалтын мэдээлэл</p>
          <h2>
            <Price price={course.price} originalPrice={course.originalPrice} />
          </h2>
          <dl className="facts">
            <div>
              <dt>Хэнд зориулсан</dt>
              <dd>{info.audience}</dd>
            </div>
            <div>
              <dt>Хугацаа</dt>
              <dd>{info.duration || "Лавлана уу"}</dd>
            </div>
            <div>
              <dt>Хэлбэр, хуваарь</dt>
              <dd>Бүртгүүлэхдээ тодруулна уу.</dd>
            </div>
            <div>
              <dt>Урьдчилсан шаардлага</dt>
              <dd>Түвшин, хэрэгтэй төхөөрөмжийг багшаас лавлана уу.</dd>
            </div>
          </dl>
          <p>
            Үнэд НӨАТ ороогүй. Messenger-ээр холбогдож хуваарь, бүртгэлээ
            баталгаажуулаарай.
          </p>
          <Action href={Facebook_CHAT_URL} external>
            Бүртгэл лавлах
          </Action>
          {course.qpay && (
            <Action href={course.qpay} external secondary>
              QPay-ээр төлөх
            </Action>
          )}
          <Action href={`tel:+976${PHONE}`} secondary>
            +976 {PHONE}
          </Action>
        </aside>
      </div>
      {moreCourses?.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <div className="section-heading">
              <h2>Үргэлжлүүлэн суралцах.</h2>
              <TextLink href="/courses">Бүх сургалт</TextLink>
            </div>
            <div className="course-grid">
              {moreCourses.slice(0, 3).map((c: any, index: number) => (
                <CourseCard key={c.slug} course={c} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
