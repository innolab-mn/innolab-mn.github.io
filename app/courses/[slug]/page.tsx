import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllCourses, getCourseAndMoreCourses } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import LandingEffects from "@/app/_components/landing-effects";
import RichContent from "@/app/_components/rich-content";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, PHONE, Price, SERIF, Words, firstImage, img } from "@/app/_components/ui";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const courses = (await getAllCourses(false)) ?? [];
  return courses.map((course: any) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCourseAndMoreCourses(slug, false);
  const course = data?.course;
  if (!course) return { title: "Сургалт олдсонгүй — InnoLab" };
  const image = firstImage(course);
  return {
    title: `${course.title} — InnoLab`,
    openGraph: {
      title: course.title,
      type: "article",
      images: image ? [{ url: img(image, 1200)!, alt: course.title }] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCourseAndMoreCourses(slug, false);
  const course = data?.course;
  if (!course) notFound();

  const others: any[] = (data.moreCourses ?? []).slice(0, 3);
  const image = firstImage(course);

  return (
    <>
      <LandingEffects />
      <LandingNav cta={{ href: "#enroll", label: "Бүртгүүлэх" }} />

      {/* ============ HERO ============ */}
      <header className="relative overflow-hidden pt-32 sm:pt-44">
        <div className="absolute inset-0 pointer-events-none" data-parallax="0.3">
          <div className="drift-a absolute top-[10%] left-[6%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#42A85D]/15 to-transparent border border-[#1E4D33]/10" />
          <div className="drift-b absolute top-[18%] right-[8%] w-28 h-28 sm:w-44 sm:h-44 rounded-[40%] bg-gradient-to-tl from-[#E4EFDA] to-white/10 border border-[#1E4D33]/10" />
          <div className="drift-c absolute top-[40%] left-[45%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#E4EFDA]/70 border border-[#1E4D33]/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
          <a href="/courses" className="group inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-10" data-reveal="">
            <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
            Бүх сургалт
          </a>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-14" data-reveal="">
            <div className="lg:col-span-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Сургалт</p>
              <h1 className={`${DISPLAY} text-4xl sm:text-6xl lg:text-7xl leading-[1] font-light tracking-tighter`}>
                <Words text={course.title} />
              </h1>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              {course.price > 0 && (
                <>
                  <p className={`${DISPLAY} text-3xl sm:text-4xl font-light tracking-tighter`}>
                    <Price price={course.price} originalPrice={course.originalPrice} />
                  </p>
                  <p className="text-sm text-black/40 mt-1">НӨАТ ороогүй</p>
                </>
              )}
              <div className="mt-6 flex flex-wrap lg:justify-end items-center gap-5">
                <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 bg-[#1E4D33] hover:bg-[#2A6647] active:scale-95 text-white font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-[#1E4D33]/30">
                  Бүртгүүлэх
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a href={`tel:${PHONE}`} className="text-sm text-black/50 hover:text-black transition-colors duration-300 border-b border-black/20 hover:border-black pb-0.5">
                  {PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>

        {image && (
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] shadow-2xl shadow-black/15 bg-white">
              <img data-panel-img="" src={img(image, 2000)} alt={course.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </header>

      {/* ============ CONTENT ============ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <aside className="lg:col-span-4 lg:order-2">
            <div className="lg:sticky lg:top-32 rounded-2xl bg-[#E4EFDA] p-7 sm:p-8" data-reveal="">
              <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-5">Бүртгэл</p>
              {course.price > 0 && (
                <div className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-4 mb-4">
                  <span className="text-sm text-black/50">Төлбөр</span>
                  <span className="text-lg font-medium"><Price price={course.price} originalPrice={course.originalPrice} /></span>
                </div>
              )}
              <p className="text-base text-black/60 leading-relaxed mb-6">
                Хичээлийн хуваарь, бүртгэлийн талаар Facebook chat эсвэл утсаар лавлана уу.
              </p>
              <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group w-full inline-flex items-center justify-center gap-2.5 bg-[#1E4D33] hover:bg-[#2A6647] active:scale-95 text-white font-medium text-base px-6 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-[#1E4D33]/25">
                Facebook chat
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href={`tel:${PHONE}`} className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-[#1E4D33]/25 hover:border-[#1E4D33] text-[#1E4D33] font-medium text-base px-6 py-3.5 rounded-full transition-colors duration-300">
                +976 {PHONE}
              </a>
            </div>
          </aside>
          <article className="lg:col-span-8 lg:order-1 max-w-3xl">
            <RichContent content={course.content} />
          </article>
        </div>
      </section>

      {/* ============ OTHER COURSES ============ */}
      {others.length > 0 && (
        <section className="bg-[#E4EFDA] py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex items-end justify-between gap-6 mb-14" data-reveal="">
              <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
                <Words text="Бусад" />
                <em className={SERIF}>
                  <Words text="сургалтууд" start={1} />
                </em>
              </h2>
              <a href="/courses" className="group hidden sm:inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors">
                Бүгдийг үзэх
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.map((other, i) => (
                <a key={other.slug} href={`/courses/${other.slug}`} className="group flex flex-col" data-reveal="" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="rounded-xl overflow-hidden aspect-[4/3] mb-5 shadow-xl shadow-black/10 bg-white">
                    {firstImage(other) && (
                      <img src={img(firstImage(other), 900)} alt={other.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    )}
                  </div>
                  <h3 className={`${DISPLAY} text-xl font-light tracking-tighter leading-snug mb-3 group-hover:text-[#1E4D33]`}>{other.title}</h3>
                  <div className="mt-auto flex items-center justify-between text-sm pt-2 border-t border-black/10">
                    <Price price={other.price} originalPrice={other.originalPrice} />
                    <ArrowUpRight className="w-4 h-4 text-[#1E4D33] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ENROLL ============ */}
      <section id="enroll" className="bg-[#1E4D33] py-24 sm:py-32 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#42A85D] font-medium mb-6">Бүртгэл</p>
            <h2 className={`${DISPLAY} text-4xl sm:text-6xl leading-[1.05] font-light tracking-tighter text-white`}>
              <Words text="Суралцахад" />
              <em className={SERIF}>
                <Words text="бэлэн үү?" start={1} />
              </em>
            </h2>
            <p className="text-lg text-white/60 mt-6 max-w-xl">
              Бидэнтэй холбогдож суудлаа баталгаажуулаарай. Хуваарь, төлбөрийн нөхцөлийн талаар дэлгэрэнгүй тайлбарлаж өгнө.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-4" data-reveal="" style={{ transitionDelay: "150ms" }}>
            <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 bg-white hover:bg-[#E4EFDA] active:scale-95 text-[#1E4D33] font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-black/20">
              Facebook chat
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 border border-white/25 hover:border-white text-white font-medium text-base px-7 py-3.5 rounded-full transition-colors duration-300">
              +976 {PHONE}
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
