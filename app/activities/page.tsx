import { getAllPosts } from "@/lib/api";
import { Facebook_CHAT_URL, Facebook_URL, Youtube_URL } from "@/lib/constants";
import { Action, PageHeader, TextLink } from "../_components/ui";
import { NewsRow } from "../_components/cards";
export const dynamic = "force-static";
export const metadata = {
  title: "Үйл ажиллагаа, оролцох боломж — InnoLab",
  description:
    "Клубтэй танилцаж, сургалт болон хамтран бүтээх боломжийн талаар мэдээлэл аваарай.",
};
export default async function ActivitiesPage() {
  const posts = await getAllPosts(false);
  return (
    <>
      <PageHeader
        label="Манай клуб / Оролцох"
        title="Хамтдаа суралцаж, хамтдаа бүтээе."
        intro="Технологи сонирхдог бол эхний алхмаа хийгээрэй. Сургалт сонгох, бүтээлийн санаагаа ярилцах, туршлага судлах боломжууд энд бий."
      />
      <section className="container page-content">
        <div className="learning-path" style={{ marginTop: 0 }}>
          <article>
            <small>01 / СУРАЛЦАХ</small>
            <h3>Хөтөлбөрөө сонгох</h3>
            <p>
              Өөрийн сонирхолд тохирох 3D загварчлал, програмчлал, робот
              техникийн сургалттай танилцаарай.
            </p>
            <TextLink href="/courses">Сургалт үзэх</TextLink>
          </article>
          <article>
            <small>02 / ХОЛБОГДОХ</small>
            <h3>Санаагаа хуваалцах</h3>
            <p>
              Клубийн үйл ажиллагаанд оролцох, хамтран бүтээх сонирхлоо бидэнд
              хэлээрэй.
            </p>
            <TextLink href="/contact">Холбогдох</TextLink>
          </article>
          <article>
            <small>03 / ТУРШЛАГА СУДЛАХ</small>
            <h3>Бүтээл, хичээл үзэх</h3>
            <p>
              Манай YouTube сувгаар технологи, бүтээлийн талаарх агуулгатай
              танилцаарай.
            </p>
            <TextLink href={Youtube_URL}>YouTube суваг</TextLink>
          </article>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container participate-grid">
          <div>
            <p className="eyebrow">Дараагийн үйл ажиллагаа</p>
            <h2>
              Оролцох боломжоо
              <br />
              тодруулаарай.
            </h2>
            <p>
              Энд баталгаажсан дараагийн арга хэмжээний хуваарь хараахан
              нийтлэгдээгүй байна. Огноо, байршил, оролцох нөхцөлийг биднээс
              асуугаарай.
            </p>
            <div className="actions">
              <Action href={Facebook_CHAT_URL} external>
                Оролцох талаар асуух
              </Action>
              <TextLink href={Facebook_URL}>Facebook мэдээ</TextLink>
            </div>
          </div>
          <div>
            <p className="eyebrow">Клубийн мэдээ, тэмдэглэл</p>
            {posts.slice(0, 3).map((post: any) => (
              <NewsRow key={post.slug} post={post} />
            ))}
            <div className="actions">
              <TextLink href="/posts">Бүх мэдээ</TextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
