import { notFound } from "next/navigation";
import { getAllProducts, getProductAndMoreProducts } from "@/lib/api";
import { productCategory } from "@/lib/course-info";
import { Facebook_CHAT_URL } from "@/lib/constants";
import {
  Action,
  img,
  PageHeader,
  PHONE,
  Price,
  TextLink,
} from "@/app/_components/ui";
import { ProductCard } from "@/app/_components/cards";
import RichContent from "@/app/_components/rich-content";
import Gallery from "./gallery";
export const dynamic = "force-static";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return (await getAllProducts(false)).map((p: any) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { product } = await getProductAndMoreProducts(slug, false);
  return {
    title: product
      ? `${product.title} — InnoLab дэлгүүр`
      : "Бүтээгдэхүүн олдсонгүй — InnoLab",
  };
}
export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const { product, moreProducts } = await getProductAndMoreProducts(
    slug,
    false,
  );
  if (!product) notFound();
  const images = (product.imageCollection?.items ?? [])
    .filter((i: any) => i?.url)
    .map((i: any) => img(i.url, 1200)!);
  return (
    <>
      <PageHeader
        label={productCategory(product)}
        title={product.title}
        back={{ href: "/products", label: "Дэлгүүр" }}
        actions={
          <>
            <Action href="#order">Захиалгын мэдээлэл</Action>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
            />
          </>
        }
      />
      <div className="container detail-grid page-content">
        <div>
          <Gallery images={images} title={product.title} />
          {product.content?.json && (
            <article className="content-prose" style={{ marginTop: 40 }}>
              <h2>Бүтээгдэхүүний тухай</h2>
              <RichContent content={product.content} />
            </article>
          )}
        </div>
        <aside className="detail-aside" id="order">
          <p className="eyebrow">Захиалгын мэдээлэл</p>
          <h2>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
            />
          </h2>
          <dl className="facts">
            <div>
              <dt>Ангилал</dt>
              <dd>{productCategory(product)}</dd>
            </div>
            <div>
              <dt>Бэлэн эсэх</dt>
              <dd>Захиалахаас өмнө лавлана уу.</dd>
            </div>
            <div>
              <dt>Хүлээн авах</dt>
              <dd>Арга, хугацааг тохиролцоно.</dd>
            </div>
          </dl>
          <p>
            Үнэд НӨАТ ороогүй. Бүтээгдэхүүний нэрийг Messenger-ээр илгээж
            захиалгаа тодруулаарай.
          </p>
          <Action href={Facebook_CHAT_URL} external>
            Messenger-ээр захиалах
          </Action>
          {product.qpay && (
            <Action href={product.qpay} external secondary>
              QPay-ээр төлөх
            </Action>
          )}
          <Action href={`tel:+976${PHONE}`} secondary>
            +976 {PHONE}
          </Action>
        </aside>
      </div>
      {moreProducts?.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <div className="section-heading">
              <h2>Бусад бүтээгдэхүүн.</h2>
              <TextLink href="/products">Дэлгүүр үзэх</TextLink>
            </div>
            <div className="shop-grid">
              {moreProducts.slice(0, 3).map((p: any) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
