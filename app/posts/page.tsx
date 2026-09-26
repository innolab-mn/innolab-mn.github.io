import type { Metadata } from "next";

import { getAllPosts } from "@/lib/api";
import LandingEffects from "@/app/_components/landing-effects";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, SERIF, Words, formatDate, img } from "@/app/_components/ui";
import PostCard from "@/app/_components/post-card";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Блог — InnoLab",
  description: "Робот техник, хиймэл оюун, 3D загварчлал, бүтээлийн тухай InnoLab-ийн нийтлэлүүд.",
};

export default async function BlogPage() {
  const posts = (await getAllPosts(false)) ?? [];
  const [featured, ...rest] = posts;

  return (
    <>
      <LandingEffects />
      <LandingNav />

      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden pt-32 sm:pt-44 pb-14 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none" data-parallax="0.3">
          <div className="drift-a absolute top-[12%] right-[10%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#42A85D]/15 to-transparent border border-[#1E4D33]/10" />
          <div className="drift-c absolute top-[55%] right-[34%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#E4EFDA]/80 border border-[#1E4D33]/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end" data-reveal="">
          <div className="lg:col-span-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Блог · {posts.length} нийтлэл</p>
            <h1 className={`${DISPLAY} text-5xl sm:text-7xl lg:text-8xl leading-[0.95] font-light tracking-tighter`}>
              <Words text="Бидний" />
              <em className={SERIF}>
                <Words text="тэмдэглэл." start={1} />
              </em>
            </h1>
          </div>
          <p className="lg:col-span-4 text-base sm:text-lg text-black/60 leading-relaxed">
            Робот техник, хиймэл оюун, 3D загварчлал болон бидний бүтээлүүдийн тухай нийтлэлүүд.
          </p>
        </div>
      </header>

      {/* ============ FEATURED ============ */}
      {featured && (
        <section className="pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <a href={`/posts/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center" data-reveal="">
              <div className="lg:col-span-7 rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl shadow-black/15 bg-[#E4EFDA]">
                {featured.coverImage?.url && (
                  <img data-panel-img="" src={img(featured.coverImage.url, 1600)} alt={featured.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                )}
              </div>
              <div className="lg:col-span-5">
                <p className="text-xs text-[#1E4D33] font-medium mb-4">
                  Шинэ · <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  {featured.author?.name && <span className="text-black/40"> · {featured.author.name}</span>}
                </p>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl leading-[1.05] font-light tracking-tighter group-hover:text-[#1E4D33] transition-colors`}>
                  {featured.title}
                </h2>
                {featured.excerpt && <p className="text-lg text-black/60 mt-5 leading-relaxed line-clamp-4">{featured.excerpt}</p>}
                <span className="mt-8 inline-flex items-center gap-2.5 bg-[#1E4D33] group-hover:bg-[#2A6647] text-white font-medium text-base px-7 py-3.5 rounded-full transition-colors duration-300 shadow-xl shadow-[#1E4D33]/30">
                  Унших
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ============ ALL POSTS ============ */}
      {rest.length > 0 && (
        <section className="bg-[#E4EFDA]/50 border-t border-black/5 py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-light tracking-tighter mb-12`} data-reveal="">
              <Words text="Бүх" />
              <em className={SERIF}>
                <Words text="нийтлэл" start={1} />
              </em>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {rest.map((post: any, i: number) => (
                <PostCard key={post.slug} post={post} index={i % 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </>
  );
}
