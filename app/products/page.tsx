import type { Metadata } from "next";

import { getAllCourses, getAllProducts } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import LandingEffects from "@/app/_components/landing-effects";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, PHONE, SERIF, Words, firstImage, img } from "@/app/_components/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Дэлгүүр — InnoLab",
  description: "Робот гар, мотор, 3D хэвлэлийн эд ангиуд. InnoLab-ийн дэлгүүр.",
};

function discountOf(product: any) {
  return product.originalPrice && product.price && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
}

function Badges({ product }: { product: any }) {
  const discount = discountOf(product);
  if (!product.new && !discount) return null;
  return (
    <div className="absolute top-4 left-4 flex gap-2">
      {product.new && <span className="text-xs font-medium bg-[#42A85D] text-black rounded-full px-3 py-1">Шинэ</span>}
      {discount > 0 && <span className="text-xs font-medium bg-[#1E4D33] text-white rounded-full px-3 py-1">−{discount}%</span>}
    </div>
  );
}

function PriceStack({ product, large = false }: { product: any; large?: boolean }) {
  if (!product.price) return null;
  return (
    <div>
      {discountOf(product) > 0 && (
        <p className="text-sm text-black/35 line-through">{formatPrice(product.originalPrice)}₮</p>
      )}
      <p className={`${DISPLAY} ${large ? "text-3xl sm:text-4xl" : "text-2xl"} font-light tracking-tighter`}>{formatPrice(product.price)}₮</p>
    </div>
  );
}

export default async function ProductsPage() {
  const [products = [], courses = []] = await Promise.all([getAllProducts(false), getAllCourses(false)]);
  const [featured, ...rest] = products;
  const robotCourse = courses.find((c: any) => /so-arm|робот/i.test(c.title));

  return (
    <>
      <LandingEffects />
      <LandingNav cta={{ href: Facebook_CHAT_URL, label: "Захиалах" }} />

      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden pt-32 sm:pt-44 pb-14 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none" data-parallax="0.3">
          <div className="drift-a absolute top-[14%] right-[8%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#42A85D]/15 to-transparent border border-[#1E4D33]/10" />
          <div className="drift-b absolute top-[50%] right-[30%] w-20 h-20 sm:w-28 sm:h-28 rounded-[40%] bg-[#E4EFDA]/80 border border-[#1E4D33]/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end" data-reveal="">
          <div className="lg:col-span-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Дэлгүүр · {products.length} бүтээгдэхүүн</p>
            <h1 className={`${DISPLAY} text-5xl sm:text-7xl lg:text-8xl leading-[0.95] font-light tracking-tighter`}>
              <Words text="Бүтээлээ" />
              <em className={SERIF}>
                <Words text="эхлүүл." start={1} />
              </em>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-base sm:text-lg text-black/60 leading-relaxed">
              Робот гар, мотор, 3D хэвлэлийн эд ангиуд. Бидний үйл ажиллагааг дэмжин худалдан авалт хийсэнд баярлалаа.
            </p>
            <p className="text-sm text-black/40 mt-3">Үнэд НӨАТ ороогүй.</p>
          </div>
        </div>
      </header>

      {/* ============ FEATURED ============ */}
      {featured && (
        <section className="pb-8 sm:pb-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <a href={`/products/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-white border border-black/5 shadow-2xl shadow-black/10" data-reveal="">
              <div className="relative lg:col-span-7 aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-white overflow-hidden">
                {firstImage(featured) && (
                  <img data-panel-img="" src={img(firstImage(featured), 1600)} alt={featured.title} className="absolute inset-0 w-full h-full object-contain p-8 sm:p-12 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                )}
                <Badges product={featured} />
              </div>
              <div className="lg:col-span-5 bg-[#E4EFDA] p-8 sm:p-10 flex flex-col">
                <p className="text-xs text-[#1E4D33] font-medium mb-4">01 — Онцлох</p>
                <h2 className={`${DISPLAY} text-3xl sm:text-4xl leading-[1.1] font-light tracking-tighter group-hover:text-[#1E4D33] transition-colors`}>{featured.title}</h2>
                <div className="mt-auto pt-10 flex flex-wrap items-end justify-between gap-6">
                  <PriceStack product={featured} large />
                  <span className="inline-flex items-center gap-2 bg-[#1E4D33] group-hover:bg-[#2A6647] text-white text-sm font-medium px-5 py-3 rounded-full transition-colors duration-300 whitespace-nowrap">
                    Дэлгэрэнгүй
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ============ GRID ============ */}
      {rest.length > 0 && (
        <section className="pb-24 sm:pb-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-2">
            {rest.map((product: any, i: number) => (
              <a key={product.slug} href={`/products/${product.slug}`} className="group flex flex-col" data-reveal="" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white border border-black/5 shadow-xl shadow-black/10 mb-6">
                  {firstImage(product) && (
                    <img src={img(firstImage(product), 1200)} alt={product.title} className="w-full h-full object-contain p-8 group-hover:scale-[1.04] transition-transform duration-700 ease-out" />
                  )}
                  <Badges product={product} />
                </div>
                <p className="text-xs text-[#42A85D] font-medium mb-2">{String(i + 2).padStart(2, "0")}</p>
                <div className="flex items-end justify-between gap-6 border-b border-black/10 pb-5">
                  <h3 className={`${DISPLAY} text-2xl font-light tracking-tighter leading-snug group-hover:text-[#1E4D33] transition-colors`}>{product.title}</h3>
                  <ArrowUpRight className="w-5 h-5 flex-shrink-0 text-[#1E4D33] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="pt-4">
                  <PriceStack product={product} />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ============ HOW TO ORDER ============ */}
      <section className="bg-[#1E4D33] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16" data-reveal="">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#42A85D] font-medium mb-6">Захиалга</p>
              <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter text-white`}>
                <Words text="Хэрхэн" />
                <em className={SERIF}>
                  <Words text="захиалах вэ?" start={1} />
                </em>
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 bg-white hover:bg-[#E4EFDA] active:scale-95 text-[#1E4D33] font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300">
                Facebook chat
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 border border-white/25 hover:border-white text-white font-medium text-base px-7 py-3.5 rounded-full transition-colors duration-300">
                +976 {PHONE}
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              { n: "01", title: "Сонгох", text: "Хэрэгтэй бүтээгдэхүүнээ сонгож, дэлгэрэнгүй мэдээлэлтэй нь танилцана." },
              { n: "02", title: "Холбогдох", text: "Facebook chat эсвэл утсаар холбогдож, захиалгаа өгнө." },
              { n: "03", title: "Хүлээн авах", text: "Төлбөр, хүлээн авах нөхцөлөө тохиролцоод бүтээгдэхүүнээ авна." },
            ].map((step, i) => (
              <div key={step.n} className="bg-[#1E4D33] p-8 sm:p-10" data-reveal="" style={{ transitionDelay: `${i * 120}ms` }}>
                <p className="text-xs text-[#42A85D] font-medium mb-6">{step.n}</p>
                <h3 className={`${DISPLAY} text-2xl font-light tracking-tighter text-white mb-3`}>{step.title}</h3>
                <p className="text-base text-white/55 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COURSE CROSS-SELL ============ */}
      {robotCourse && (
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <a href={`/courses/${robotCourse.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal="">
              <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl shadow-black/15 bg-white">
                {firstImage(robotCourse) && (
                  <img src={img(firstImage(robotCourse), 1200)} alt={robotCourse.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                )}
              </div>
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Сургалт</p>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl leading-[1.05] font-light tracking-tighter`}>
                  Робот гараа <em className={SERIF}>програмчилж сур.</em>
                </h2>
                <p className="text-lg text-black/60 mt-5 max-w-lg">{robotCourse.title}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-base text-black border-b border-black/20 group-hover:border-[#1E4D33] pb-1 transition-colors duration-300">
                  Сургалтыг үзэх
                  <ArrowUpRight className="w-4 h-4 text-[#1E4D33] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </a>
          </div>
        </section>
      )}

      <LandingFooter />
    </>
  );
}
