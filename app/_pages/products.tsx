import { type Locale, translator, localeHref } from "@/lib/i18n";
import { getAllProducts } from "@/lib/api";
import { Action, EmptyState, PageHeader } from "@/app/_components/ui";
import ProductCatalog from "@/app/_components/product-catalog";
import { Facebook_CHAT_URL } from "@/lib/constants";
export const dynamic = "force-static";
export const metadata = {
  title: "Дэлгүүр — InnoLab",
  description:
    "Робот гар, мотор, 3D хэвлэлийн эд анги. Бүтээгдэхүүнээ сонгож захиалгын мэдээлэл аваарай.",
};
export default async function ProductsPage({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  const products = await getAllProducts(false);
  return (
    <>
      <PageHeader
        label={t("Бүтээлээ эхлүүлэх / Дэлгүүр")}
        title={t("Дараагийн төсөлд тань.")}
        intro={t(
          "Робот гар, мотор, 3D хэвлэсэн эд анги. Бүтээгдэхүүнээ сонгоод, захиалгын нөхцөлийг бидэнтэй тохиролцоорой.",
        )}
        locale={locale}
      />
      <section className="container page-content">
        <h2 className="sr-only">{t("Бүтээгдэхүүний сан")}</h2>
        {products.length ? (
          <ProductCatalog products={products} locale={locale} />
        ) : (
          <EmptyState
            title={t("Бүтээгдэхүүний мэдээлэл удахгүй нэмэгдэнэ.")}
            locale={locale}
          />
        )}
        <p className="note">
          {t(
            "Үнэд НӨАТ ороогүй. Бэлэн эсэх, үнэ болон хүлээн авах нөхцөлийг захиалахаасаа өмнө лавлана уу.",
          )}
        </p>
      </section>
      <section className="section section-tint">
        <div className="container">
          <p className="eyebrow">{t("Захиалга")}</p>
          <div className="section-heading">
            <h2>{t("Сонго. Холбогд. Тохиролц.")}</h2>
            <Action href={Facebook_CHAT_URL} external locale={locale}>
              {t("Захиалга лавлах")}
            </Action>
          </div>
          <div className="learning-path">
            {[
              [
                "01",
                t("Бүтээгдэхүүнээ сонгох"),
                t("Зураг, тайлбар, үнийн мэдээлэлтэй танилцаарай."),
              ],
              [
                "02",
                t("Захиалгаа тодруулах"),
                t("Messenger эсвэл утсаар бэлэн эсэх, төлбөрөө лавлаарай."),
              ],
              [
                "03",
                t("Хүлээн авах"),
                t("Хүлээн авах арга, хугацааг бидэнтэй тохиролцоорой."),
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <small>{n}</small>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
