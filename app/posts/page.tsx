import { getAllPosts } from "@/lib/api";
import { EmptyState, PageHeader } from "../_components/ui";
import PostCard from "../_components/post-card";
export const dynamic = "force-static";
export const metadata = {
  title: "Мэдээ, тэмдэглэл — InnoLab",
  description:
    "Клубийн үйл ажиллагаа, робот техник, хиймэл оюун, 3D загварчлалын тухай мэдээ, тэмдэглэл.",
};
export default async function PostsPage() {
  const posts = await getAllPosts(false);
  return (
    <>
      <PageHeader
        label="Манай клуб / Мэдээ, тэмдэглэл"
        title="Бид юу туршиж, юу сурч байна вэ?"
        intro="Клубийн үйл ажиллагаа, бүтээл, технологийн тухай тэмдэглэлүүд."
      />
      <section className="container page-content">
        <h2 className="sr-only">Бүх нийтлэл</h2>
        {posts.length ? (
          <div className="course-grid" style={{ rowGap: 45 }}>
            {posts.map((post: any) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="Нийтлэл удахгүй нэмэгдэнэ." />
        )}
      </section>
    </>
  );
}
