import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllProducts, getProductAndMoreProducts } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import LandingEffects from "@/app/_components/landing-effects";
import RichContent from "@/app/_components/rich-content";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, PHONE, Price, SERIF, Words, firstImage, img } from "@/app/_components/ui";
import Gallery from "./gallery";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = (await getAllProducts(false)) ?? [];
  return products.map((product: any) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductAndMoreProducts(slug, false);
  const product = data?.product;
  if (!product) return { title: "Бүтээгдэхүүн олдсонгүй — InnoLab" };
  const image = firstImage(product);
  return {
    title: `${product.title} — InnoLab дэлгүүр`,
    openGraph: {
      title: product.title,
      type: "website",
      images: image ? [{ url: img(image, 1200)!, alt: product.title }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductAndMoreProducts(slug, false);
  const product = data?.product;
  if (!product) notFound();

  const images: string[] = (product.imageCollection?.items ?? [])
    .map((item: any) => img(item?.url, 1600))
    .filter(Boolean);
  const others: any[] = data.moreProducts ?? [];
  const discount =
    product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <>
      <LandingEffects />
      <LandingNav cta={{ href: Facebook_CHAT_URL, label: "Захиалах" }} />

      {/* ============ PRODUCT ============ */}
      <section className="pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <nav className="flex items-center gap-2 text-sm text-black/40 mb-8" aria-label="Breadcrumb" data-reveal="">
            <a href="/products" className="hover:text-black transition-colors">Дэлгүүр</a>
            <span aria-hidden="true">/</span>
            <span className="text-black/60 truncate">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7" data-reveal="">
              <Gallery images={images} title={product.title} />
            </div>

            <aside className="lg:col-span-5 lg:sticky lg:top-28" data-reveal="" style={{ transitionDelay: "120ms" }}>
              <div className="rounded-2xl bg-[#1E4D33] text-white p-7 sm:p-9 shadow-2xl shadow-[#1E4D33]/30">
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.new && (
                    <span className="text-xs font-medium bg-[#42A85D] text-black rounded-full px-3 py-1">Шинэ</span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-medium border border-white/25 text-white/80 rounded-full px-3 py-1">−{discount}%</span>
                  )}
                </div>
                <h1 className={`${DISPLAY} text-3xl sm:text-4xl leading-[1.1] font-light tracking-tighter`}>
                  <Words text={product.title} />
                </h1>

                {product.price > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    {discount > 0 && (
                      <p className="text-base text-white/40 line-through mb-1">{formatPrice(product.originalPrice)}₮</p>
                    )}
                    <p className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>{formatPrice(product.price)}₮</p>
                    <p className="text-sm text-white/40 mt-2">НӨАТ ороогүй</p>
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {product.qpay && (
                    <a href={product.qpay} target="_blank" rel="noopener noreferrer" className="group w-full inline-flex items-center justify-center gap-2.5 bg-[#42A85D] hover:bg-[#4FBC6B] active:scale-95 text-black font-medium text-base px-6 py-3.5 rounded-full transition-all duration-300">
                      QPay-ээр төлөх
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  )}
                  <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-[#E4EFDA] active:scale-95 text-[#1E4D33] font-medium text-base px-6 py-3.5 rounded-full transition-all duration-300">
                    Facebook chat-аар захиалах
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <a href={`tel:${PHONE}`} className="w-full inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white text-white font-medium text-base px-6 py-3.5 rounded-full transition-colors duration-300">
                    +976 {PHONE}
                  </a>
                </div>

                <p className="mt-6 text-sm text-white/50 leading-relaxed">
                  Бидний үйл ажиллагааг дэмжин худалдан авалт хийсэнд баярлалаа.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ DESCRIPTION ============ */}
      {product.content?.json && (
        <section className="bg-white border-y border-black/5 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 sm:px-10">
            <div className="mb-12" data-reveal="">
              <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Дэлгэрэнгүй</p>
              <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
                <Words text="Бүтээгдэхүүний" />
                <em className={SERIF}>
                  <Words text="тухай" start={1} />
                </em>
              </h2>
            </div>
            <RichContent content={product.content} />
          </div>
        </section>
      )}

      {/* ============ MORE PRODUCTS ============ */}
      {others.length > 0 && (
        <section className="bg-[#1E4D33] py-24 sm:py-32 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12" data-reveal="">
              <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter text-white`}>
                <Words text="Бусад" />
                <em className={SERIF}>
                  <Words text="бүтээгдэхүүн" start={1} />
                </em>
              </h2>
              <a href="/products" className="group inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                Дэлгүүр
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <div data-reveal="">
              {others.map((other, i) => (
                <a
                  key={other.slug}
                  href={`/products/${other.slug}`}
                  className={`group flex items-center gap-5 border-t ${i === others.length - 1 ? "border-b" : ""} border-white/10 py-6 sm:py-8 hover:border-[#42A85D]/50 transition-colors duration-500`}
                  data-preview={img(firstImage(other), 600)}
                >
                  {firstImage(other) && (
                    <img src={img(firstImage(other), 200)} alt="" className="lg:hidden w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-white" />
                  )}
                  <span className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                    <span className={`${DISPLAY} text-xl sm:text-3xl text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-500 font-light tracking-tighter`}>
                      {other.title}
                    </span>
                    <span className="text-sm sm:text-base text-white/50 group-hover:text-[#42A85D] transition-colors duration-500 sm:text-right">
                      <Price price={other.price} originalPrice={other.originalPrice} tone="light" />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div id="cursor-preview" className="hidden lg:block fixed z-40 pointer-events-none w-56 aspect-[4/3] rounded-lg overflow-hidden opacity-0 scale-90 transition-all duration-300 ease-out shadow-2xl shadow-black/50 bg-white">
            <img id="cursor-preview-img" src={img(firstImage(others[0]), 600)} alt="" className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      <LandingFooter />
    </>
  );
}
