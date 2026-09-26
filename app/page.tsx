import type { Metadata } from "next";

import { getAllCourses, getAllPosts, getAllProducts, getAllProjects } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import LandingEffects from "@/app/_components/landing-effects";
import PostCard from "@/app/_components/post-card";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, MODULUS_URL, PHONE, Price, SERIF, Words, firstImage, img } from "@/app/_components/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "InnoLab — Санаанаас бодит биет хүртэлх аялал",
  description:
    "3D загварчлал, 3D хэвлэл, робот техникийн сургалт, төсөл, дэлгүүр. Технологид дуртай залуусын лаборатори.",
};

export default async function LandingPage() {
  const [projects = [], courses = [], products = [], posts = []] = await Promise.all([
    getAllProjects(false),
    getAllCourses(false),
    getAllProducts(false),
    getAllPosts(false),
  ]);
  const latestPosts = posts.slice(0, 3);

  // Project photos are only used as imagery; the page has no projects section.
  const featured = projects.filter((p: any) => firstImage(p)).slice(0, 2);
  const heroImage = img(firstImage(featured[0]), 2400);
  const pillarImages = [firstImage(products[0]), firstImage(courses[0]), firstImage(featured[1])];

  return (
    <>
      <LandingEffects />

      <LandingNav home="#top" cta={{ href: "#contact", label: "Холбогдох" }} />

      {/* ============ HERO ============ */}
      <header id="top" className="relative min-h-screen overflow-hidden flex flex-col">
        <div className="absolute inset-0" data-parallax="0.15">
          {heroImage && (
            <img src={heroImage} alt="" className="w-full h-full object-cover scale-110 opacity-90" />
          )}
        </div>
        <div className="absolute inset-0 pointer-events-none" data-parallax="0.3">
          <div className="drift-a absolute top-[12%] left-[8%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-sm border border-white/20 shadow-[inset_0_0_60px_rgba(255,255,255,0.25)]" />
          <div className="drift-b absolute top-[28%] right-[10%] w-28 h-28 sm:w-44 sm:h-44 rounded-[40%] bg-gradient-to-tl from-[#42A85D]/25 to-white/10 backdrop-blur-md border border-white/15 shadow-[inset_0_0_40px_rgba(66,168,93,0.3)]" />
          <div className="drift-c absolute top-[52%] left-[38%] w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-white/20 to-transparent backdrop-blur-[2px] border border-white/25" />
          <div className="drift-b absolute top-[8%] left-[55%] w-14 h-14 sm:w-20 sm:h-20 rounded-[45%] bg-white/10 backdrop-blur-sm border border-white/20" />
          <div className="drift-a absolute bottom-[38%] right-[28%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#42A85D]/20 to-transparent backdrop-blur-sm border border-white/10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBFAF7] via-[#FBFAF7]/60 to-[#FBFAF7]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FBFAF7]/70 via-transparent to-[#FBFAF7]/30" />

        <div className="relative z-10 flex-1 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 pb-[24vw] sm:pb-[20vw] lg:pb-[17vw] pt-40">
            <div className="max-w-3xl" data-reveal="">
              <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-8">
                InnoLab — Innovation Laboratory
              </p>
              <h1 className={`${DISPLAY} text-5xl sm:text-7xl lg:text-8xl leading-[0.95] font-light tracking-tighter`}>
                <Words text="Санаанаас бодит биет хүртэлх" />
                <em className={SERIF}>
                  <Words text="аялал." start={4} />
                </em>
              </h1>
              <p className="mt-8 text-base sm:text-lg text-black/60 max-w-xl">
                Технологид дуртай залуусдаа мэдлэг, туршлагаа хуваалцаж, санааг нь бодит бүтээл болгоход хамтдаа алхдаг лаборатори.
              </p>
              <p className="mt-4 text-sm text-black/45 tracking-wide">/ 3D загварчлал · 3D хэвлэл · Робот техник /</p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <a href="#courses" className="group inline-flex items-center gap-2.5 bg-[#1E4D33] hover:bg-[#2A6647] active:scale-95 text-white font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-[#1E4D33]/30 hover:shadow-2xl hover:shadow-[#1E4D33]/40">
                  Сургалтад хамрагдах
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a href="#store" className="text-sm text-black/50 hover:text-black transition-colors duration-300 border-b border-black/20 hover:border-black pb-0.5">
                  Дэлгүүр үзэх
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-[4vw] left-0 w-full z-[5] pointer-events-none overflow-hidden" data-parallax="0.5">
          <p
            className={`${DISPLAY} text-[24vw] leading-none text-center text-[#1E4D33]/10 whitespace-nowrap select-none font-light tracking-tighter`}
            style={{ WebkitTextStroke: "1px rgba(30, 77, 51, 0.12)" }}
            aria-hidden="true"
          >
            INNOLAB
          </p>
        </div>
      </header>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-[#E4EFDA] text-black py-24 sm:py-36 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mb-20" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Бидний түүх</p>
            <h2 className={`${DISPLAY} text-4xl sm:text-6xl leading-[1.05] font-light tracking-tighter`}>
              <Words text="Мөрөөдлөө бодит болгоход" />
              <em className={SERIF}>
                <Words text="туслах хамт олон." start={3} />
              </em>
            </h2>
            <p className="text-lg text-black/60 mt-6 max-w-2xl leading-relaxed">
              Өмнө нь их хэмжээний цаг хугацаа, хөрөнгө шаарддаг байсан төслүүдийг одоо гарын доорх нөөц боломжоор хэрэгжүүлэх үүд нээгдлээ. Энэ боломжид урамшин бид өөрт байсан ганц 3D хэвлэгчээ ашиглаж, хиймэл оюунаар шатар тоглодог робот бүтээх төслөө эхлүүлсэн юм.
            </p>
            <p className="text-lg text-black/60 mt-4 max-w-2xl leading-relaxed">
              Хоббигоо хөгжүүлэх явцад хуримтлуулсан мэдлэг туршлагаа хуваалцах, зохион бүтээх хүсэлтэй залуусыг дэмжих зорилгоор InnoLab-ийг үүсгэн байгууллаа.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                letter: "A",
                title: "3D хэвлэл",
                text: "3D хэвлэгч Монголын залуусын хувьд ч технологийн хамгийн энгийн бөгөөд чухал хэрэглээ болжээ. Бүтээлийг бодит болгох үндэс нь сайн загварчлал.",
              },
              {
                letter: "B",
                title: "Blender сургалт",
                text: "3D загварчлалын шилдэг шийдэл болох Blender программаар анхан болон ахисан түвшний сургалт, хичээлүүдийг зохион байгуулдаг.",
              },
              {
                letter: "C",
                title: "Урлан бүтээл",
                text: "Дүрслэх урлагт ч 3D хэвлэгч томоохон дэвшил авчирч, авьяаслаг залуус уран бүтээлдээ амжилттай ашиглаж байна.",
              },
            ].map((pillar, i) => (
              <div key={pillar.letter} data-reveal="" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="rounded-xl overflow-hidden aspect-[3/2] mb-6 shadow-xl shadow-black/10 bg-white">
                  {pillarImages[i] && (
                    <img src={img(pillarImages[i], 1000)} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out" />
                  )}
                </div>
                <p className="text-xs text-black/40 font-medium mb-2">{pillar.letter}</p>
                <h3 className={`${DISPLAY} text-xl mb-3 font-light tracking-tighter`}>{pillar.title}</h3>
                <p className="text-base text-black/60 leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      {courses.length > 0 && (
        <section id="courses" className="py-24 sm:py-36 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14" data-reveal="">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Сургалт</p>
                <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
                  <Words text="Бүтээж" />
                  <em className={SERIF}>
                    <Words text="суралц." start={1} />
                  </em>
                </h2>
              </div>
              <p className="text-base text-black/50 max-w-sm">Танхим болон онлайн хэлбэрээр, 20+ цагийн практик хөтөлбөрүүд.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course: any, i: number) => (
                <a
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col"
                  data-reveal=""
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="rounded-xl overflow-hidden aspect-[4/3] mb-5 shadow-xl shadow-black/10 bg-white">
                    {firstImage(course) && (
                      <img src={img(firstImage(course), 900)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    )}
                  </div>
                  <p className="text-xs text-[#42A85D] font-medium mb-2">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={`${DISPLAY} text-xl font-light tracking-tighter leading-snug mb-3 group-hover:text-[#1E4D33]`}>{course.title}</h3>
                  <div className="mt-auto flex items-center justify-between text-sm pt-2 border-t border-black/10">
                    <Price price={course.price} originalPrice={course.originalPrice} />
                    <ArrowUpRight className="w-4 h-4 text-[#1E4D33] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ STORE ============ */}
      {products.length > 0 && (
        <section id="store" className="bg-[#1E4D33] py-24 sm:py-36 relative scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12" data-reveal="">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#42A85D] font-medium mb-6">Дэлгүүр</p>
                <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter text-white`}>
                  <Words text="Бүтээлээ" />
                  <em className={SERIF}>
                    <Words text="эхлүүл." start={1} />
                  </em>
                </h2>
              </div>
              <p className="text-base text-white/50 max-w-sm">Робот гар, мотор, 3D хэвлэлийн эд ангиуд. Үнэд НӨАТ ороогүй.</p>
            </div>
            <div data-reveal="">
              {products.map((product: any, i: number) => (
                <a
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className={`group flex items-center gap-5 border-t ${i === products.length - 1 ? "border-b" : ""} border-white/10 py-6 sm:py-8 hover:border-[#42A85D]/50 transition-colors duration-500`}
                  data-preview={img(firstImage(product), 600)}
                >
                  {firstImage(product) && (
                    <img src={img(firstImage(product), 200)} alt="" className="lg:hidden w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                    <span className={`${DISPLAY} text-xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-500 font-light tracking-tighter`}>
                      {product.title}
                    </span>
                    <span className="text-sm sm:text-base text-white/50 group-hover:text-[#42A85D] transition-colors duration-500 sm:text-right">
                      <Price price={product.price} originalPrice={product.originalPrice} tone="light" />
                    </span>
                  </span>
                </a>
              ))}
            </div>
            <a href="/products" className="group mt-10 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-colors">
              Дэлгүүр рүү орох
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
          <div id="cursor-preview" className="hidden lg:block fixed z-40 pointer-events-none w-56 aspect-[4/3] rounded-lg overflow-hidden opacity-0 scale-90 transition-all duration-300 ease-out shadow-2xl shadow-black/50 bg-white">
            <img id="cursor-preview-img" src={img(firstImage(products[0]), 600)} alt="" className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      {/* ============ BLOG ============ */}
      {latestPosts.length > 0 && (
        <section id="blog" className="py-24 sm:py-36 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14" data-reveal="">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Блог</p>
                <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
                  <Words text="Шинэ" />
                  <em className={SERIF}>
                    <Words text="нийтлэлүүд" start={1} />
                  </em>
                </h2>
              </div>
              <p className="text-base text-black/50 max-w-sm">Робот техник, хиймэл оюун, 3D загварчлалын тухай тэмдэглэлүүд.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {latestPosts.map((post: any, i: number) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
            <div className="mt-16 flex justify-center" data-reveal="">
              <a href="/posts" className="group inline-flex items-center gap-2.5 border border-[#1E4D33]/25 hover:border-[#1E4D33] hover:bg-[#1E4D33] hover:text-white text-[#1E4D33] font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300">
                Бүх нийтлэл ({posts.length})
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ============ MISSION ============ */}
      <section className="bg-[#FBFAF7] border-t border-black/5 pt-24 pb-24 sm:pb-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1" data-reveal="">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[4/5] shadow-2xl shadow-black/10 bg-[#E4EFDA] flex items-center justify-center">
              <img src="/assets/innolab_logo.svg" alt="InnoLab" className="w-3/4 max-w-sm h-auto hover:scale-105 transition-transform duration-700 ease-out" />
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2" data-reveal="">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-[#1E4D33] mb-8" aria-hidden="true">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
            <blockquote className={`${DISPLAY} text-2xl sm:text-4xl leading-[1.2] font-light tracking-tighter`}>
              <Words text="“Технологид дуртай дүү нартаа өөрсдийн туршлагад үндэслэн чиг баримжаа олгож, зам мөрийг нь гэрэлтүүлэх нь бидний эрхэм зорилго.”" />
            </blockquote>
            <div className="mt-8">
              <p className="text-base font-medium">InnoLab</p>
              <p className="text-sm text-black/40">Innovation Laboratory, Улаанбаатар</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="relative overflow-hidden pt-12">
        <div className="overflow-hidden select-none pointer-events-none" aria-hidden="true">
          <p className={`${DISPLAY} text-[11vw] leading-[0.85] text-[#1E4D33]/10 whitespace-nowrap text-center -mb-[2vw] font-light tracking-tighter`}>
            САНААГАА БҮТЭЭ
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5" data-reveal="">
            <h2 className={`${DISPLAY} text-4xl sm:text-5xl leading-[1.05] mb-6 font-light tracking-tighter`}>
              <Words text="Санаагаа" />
              <br />
              <em className={SERIF}>
                <Words text="бодит болго." start={1} />
              </em>
            </h2>
            <p className="text-lg text-black/60 max-w-sm">
              Сургалт, захиалгат макет, 3D хэвлэл эсвэл робот техникийн талаар асуух зүйл байвал бидэнтэй холбогдоорой.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7" data-reveal="">
            {[
              { label: "Утас", value: `+976 ${PHONE}`, href: `tel:${PHONE}` },
              { label: "Messenger", value: "Facebook chat", href: Facebook_CHAT_URL },
              { label: "Төслүүд", value: "modulus.hotolarch.com", href: MODULUS_URL },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-baseline justify-between gap-4 border-t border-black/10 py-5 hover:border-[#1E4D33] transition-colors duration-300"
              >
                <span className="text-xs uppercase tracking-widest text-black/40">{item.label}</span>
                <span className="inline-flex items-center gap-2 text-lg text-black">
                  {item.value}
                  <ArrowUpRight className="w-4 h-4 text-[#1E4D33] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-b border-black/10 py-5">
              <span className="text-xs uppercase tracking-widest text-black/40">Хаяг</span>
              <address className="not-italic text-right text-base text-black/70">
                Сүхбаатар дүүрэг, M Building #601
                <br />
                Улаанбаатар, Монгол
              </address>
            </div>
          </div>
        </div>

        <LandingFooter />
      </section>
    </>
  );
}
