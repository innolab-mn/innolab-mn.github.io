import { type Locale, translator, localeHref } from "@/lib/i18n";
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
import Gallery from "@/app/_components/product-gallery";
import { AddToCart } from '@/app/_components/cart-controls';
export const dynamic = "force-static";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
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
export default async function ProductDetail({
  params,
  locale = "mn",
}: Props & {
  locale?: Locale;
}) {
  const t = translator(locale);
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
        label={t(productCategory(product))}
        title={product.title}
        back={{ href: "/products", label: t("Дэлгүүр") }}
        actions={
          <>
            <Action href="#order" locale={locale}>
              {t("Захиалгын мэдээлэл")}
            </Action>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              locale={locale}
            />
          </>
        }
        locale={locale}
      />
      <div className="container detail-grid page-content">
        <div>
          <Gallery images={images} title={product.title} locale={locale} />
          {product.content?.json && (
            <article className="content-prose" style={{ marginTop: 40 }}>
              <h2>{t("Бүтээгдэхүүний тухай")}</h2>
              <RichContent content={product.content} locale={locale} />
            </article>
          )}
        </div>
        <aside className="detail-aside" id="order">
          <p className="eyebrow">{t("Захиалгын мэдээлэл")}</p>
          <h2>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              locale={locale}
            />
          </h2>
          <dl className="facts">
            <div>
              <dt>{t("Ангилал")}</dt>
              <dd>{t(productCategory(product))}</dd>
            </div>
            <div>
              <dt>{t("Бэлэн эсэх")}</dt>
              <dd>{t("Захиалахаас өмнө лавлана уу.")}</dd>
            </div>
            <div>
              <dt>{t("Хүлээн авах")}</dt>
              <dd>{t("Арга, хугацааг тохиролцоно.")}</dd>
            </div>
          </dl>
          {Number(product.price)>0 ? <><AddToCart product={{slug:product.slug,title:product.title,price:Number(product.price),image:product.imageCollection?.items?.[0]?.url}} locale={locale}/><p>{locale==='en'?'Pay by bank transfer at checkout. Availability and delivery are confirmed separately.':'Сагсаа шалгаад дансаар төлнө. Бэлэн эсэх болон хүргэлтийг тусад нь баталгаажуулна.'}</p></> : <><p>
            {t(
              "Үнэд НӨАТ ороогүй. Бүтээгдэхүүний нэрийг Messenger-ээр илгээж захиалгаа тодруулаарай.",
            )}
          </p>
          <Action href={Facebook_CHAT_URL} external locale={locale}>
            {t("Messenger-ээр захиалах")}
          </Action>
          </>}
          <Action href={`tel:+976${PHONE}`} secondary locale={locale}>
            +976 {PHONE}
          </Action>
        </aside>
      </div>
      {moreProducts?.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <div className="section-heading">
              <h2>{t("Бусад бүтээгдэхүүн.")}</h2>
              <TextLink href="/products" locale={locale}>
                {t("Дэлгүүр үзэх")}
              </TextLink>
            </div>
            <div className="shop-grid">
              {moreProducts.slice(0, 3).map((p: any) => (
                <ProductCard key={p.slug} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
