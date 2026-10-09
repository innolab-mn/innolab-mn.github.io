import { getAllProducts } from "@/lib/api";
import { Action, EmptyState, PageHeader } from "../_components/ui";
import ProductCatalog from "../_components/product-catalog";
import { Facebook_CHAT_URL } from "@/lib/constants";
export const dynamic = "force-static";
export const metadata = {
  title: "Дэлгүүр — InnoLab",
  description:
    "Робот гар, мотор, 3D хэвлэлийн эд анги. Бүтээгдэхүүнээ сонгож захиалгын мэдээлэл аваарай.",
};
export default async function ProductsPage() {
  const products = await getAllProducts(false);
  return (
    <>
      <PageHeader
        label="Бүтээлээ эхлүүлэх / Дэлгүүр"
        title="Дараагийн төсөлд тань."
        intro="Робот гар, мотор, 3D хэвлэсэн эд анги. Бүтээгдэхүүнээ сонгоод, захиалгын нөхцөлийг бидэнтэй тохиролцоорой."
      />
      <section className="container page-content">
        <h2 className="sr-only">Бүтээгдэхүүний сан</h2>
        {products.length ? (
          <ProductCatalog products={products} />
        ) : (
          <EmptyState title="Бүтээгдэхүүний мэдээлэл удахгүй нэмэгдэнэ." />
        )}
        <p className="note">
          Үнэд НӨАТ ороогүй. Бэлэн эсэх, үнэ болон хүлээн авах нөхцөлийг
          захиалахаасаа өмнө лавлана уу.
        </p>
      </section>
      <section className="section section-tint">
        <div className="container">
          <p className="eyebrow">Захиалга</p>
          <div className="section-heading">
            <h2>Сонго. Холбогд. Тохиролц.</h2>
            <Action href={Facebook_CHAT_URL} external>
              Захиалга лавлах
            </Action>
          </div>
          <div className="learning-path">
            {[
              [
                "01",
                "Бүтээгдэхүүнээ сонгох",
                "Зураг, тайлбар, үнийн мэдээлэлтэй танилцаарай.",
              ],
              [
                "02",
                "Захиалгаа тодруулах",
                "Messenger эсвэл утсаар бэлэн эсэх, төлбөрөө лавлаарай.",
              ],
              [
                "03",
                "Хүлээн авах",
                "Хүлээн авах арга, хугацааг бидэнтэй тохиролцоорой.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
