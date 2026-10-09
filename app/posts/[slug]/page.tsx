import { notFound } from "next/navigation";
import { getAllPosts, getPostAndMorePosts } from "@/lib/api";
import { formatDate, img, PageHeader, TextLink } from "@/app/_components/ui";
import RichContent from "@/app/_components/rich-content";
import PostCard from "@/app/_components/post-card";
export const dynamic = "force-static";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return (await getAllPosts(false)).map((p: any) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { post } = await getPostAndMorePosts(slug, false);
  return {
    title: post ? `${post.title} — InnoLab` : "Нийтлэл олдсонгүй — InnoLab",
    description: post?.excerpt,
    openGraph: post
      ? {
          type: "article",
          title: post.title,
          description: post.excerpt,
          publishedTime: post.date,
          images: post.coverImage?.url
            ? [{ url: img(post.coverImage.url, 1200) }]
            : undefined,
        }
      : undefined,
  };
}
export default async function PostDetail({ params }: Props) {
  const { slug } = await params;
  const { post, morePosts } = await getPostAndMorePosts(slug, false);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        label="Мэдээ, тэмдэглэл"
        title={post.title}
        intro={post.excerpt}
        back={{ href: "/posts", label: "Бүх нийтлэл" }}
      />
      <article className="container page-content">
        <div className="article-header">
          <p className="note" style={{ marginTop: 0, marginBottom: 30 }}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author?.name && ` · ${post.author.name}`}
          </p>
          {post.coverImage?.url && (
            <img
              className="detail-image"
              src={img(post.coverImage.url, 1400)}
              alt={post.title}
              width="1400"
              height="850"
            />
          )}
        </div>
        <div className="article-body content-prose">
          <RichContent content={post.content} />
        </div>
      </article>
      {morePosts?.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <div className="section-heading">
              <h2>Үргэлжлүүлэн унших.</h2>
              <TextLink href="/posts">Бүх нийтлэл</TextLink>
            </div>
            <div className="course-grid">
              {morePosts.map((p: any) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
