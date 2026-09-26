import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllPosts, getPostAndMorePosts } from "@/lib/api";
import LandingEffects from "@/app/_components/landing-effects";
import RichContent from "@/app/_components/rich-content";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, SERIF, Words, formatDate, img } from "@/app/_components/ui";
import PostCard from "@/app/_components/post-card";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = (await getAllPosts(false)) ?? [];
  return posts.map((post: any) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostAndMorePosts(slug, false);
  const post = data?.post;
  if (!post) return { title: "Нийтлэл олдсонгүй — InnoLab" };
  return {
    title: `${post.title} — InnoLab блог`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: post.coverImage?.url ? [{ url: img(post.coverImage.url, 1200)!, alt: post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [data, allPosts] = await Promise.all([getPostAndMorePosts(slug, false), getAllPosts(false)]);
  const post = data?.post;
  if (!post) notFound();

  const more = (allPosts ?? []).filter((p: any) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <LandingEffects />
      <LandingNav />

      {/* ============ HEADER ============ */}
      <header className="pt-32 sm:pt-44">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center" data-reveal="">
          <a href="/posts" className="group inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-10">
            <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
            Блог
          </a>
          <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <h1 className={`${DISPLAY} text-4xl sm:text-6xl leading-[1.02] font-light tracking-tighter`}>
            <Words text={post.title} />
          </h1>
          {post.excerpt && <p className="text-lg sm:text-xl text-black/55 leading-relaxed mt-8">{post.excerpt}</p>}
          {post.author?.name && (
            <div className="mt-8 inline-flex items-center gap-3">
              {post.author.picture?.url && (
                <img src={img(post.author.picture.url, 96)} alt="" className="w-10 h-10 rounded-full object-cover bg-[#E4EFDA]" />
              )}
              <span className="text-sm font-medium">{post.author.name}</span>
            </div>
          )}
        </div>

        {post.coverImage?.url && (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-14 sm:mt-20">
            <div className="rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] shadow-2xl shadow-black/15 bg-[#E4EFDA]">
              <img data-panel-img="" src={img(post.coverImage.url, 2000)} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </header>

      {/* ============ ARTICLE ============ */}
      <article className="max-w-2xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <RichContent content={post.content} />
      </article>

      {/* ============ MORE POSTS ============ */}
      {more.length > 0 && (
        <section className="bg-[#E4EFDA] py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex items-end justify-between gap-6 mb-14" data-reveal="">
              <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
                <Words text="Бусад" />
                <em className={SERIF}>
                  <Words text="нийтлэлүүд" start={1} />
                </em>
              </h2>
              <a href="/posts" className="group hidden sm:inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors">
                Бүгдийг үзэх
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {more.map((p: any, i: number) => (
                <PostCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </>
  );
}
