import { type Locale, translator, localeHref } from "@/lib/i18n";
import { getAllPosts } from "@/lib/api";
import { EmptyState, PageHeader } from "@/app/_components/ui";
import PostCard from "@/app/_components/post-card";
export const dynamic = "force-static";
export const metadata = {
  title: "Мэдээ, тэмдэглэл — InnoLab",
  description:
    "Клубийн үйл ажиллагаа, робот техник, хиймэл оюун, 3D загварчлалын тухай мэдээ, тэмдэглэл.",
};
export default async function PostsPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  const posts = await getAllPosts(false);
  return (
    <>
      <PageHeader
        label={t("Манай клуб / Мэдээ, тэмдэглэл")}
        title={t("Бид юу туршиж, юу сурч байна вэ?")}
        intro={t(
          "Клубийн үйл ажиллагаа, бүтээл, технологийн тухай тэмдэглэлүүд.",
        )}
        locale={locale}
      />
      <section className="container page-content">
        <h2 className="sr-only">{t("Бүх нийтлэл")}</h2>
        {posts.length ? (
          <div className="course-grid" style={{ rowGap: 45 }}>
            {posts.map((post: any) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("Нийтлэл удахгүй нэмэгдэнэ.")} locale={locale} />
        )}
      </section>
    </>
  );
}
