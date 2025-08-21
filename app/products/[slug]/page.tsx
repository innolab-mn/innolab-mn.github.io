import Date from "../../date";

import { Markdown } from "@/lib/markdown";
import { getAllProducts, getProductAndMoreProducts } from "@/lib/api";

export const dynamic = "force-static"

import { Metadata } from "next";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { product } = await getProductAndMoreProducts(params.slug, true);

  return {
    title: product.title,
    openGraph: {
      title: product.title,
      description: product.title,
      type: "article",
      images: [
        {
          url: product.coverImage?.url || "/innolab_logo.svg", // fallback if missing
          alt: product.title,
        },
      ],
    },
  };
}


export async function generateStaticParams() {
  const products = await getAllProducts(true);

  return products.map((product) => ({
    slug: product.slug,
  }));
}


const ProductPage = async ({ params }: any) => {
  const { slug } = await params;
  const { product, moreProducts } = await getProductAndMoreProducts(slug, true);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-5xl">
      <article className="bg-white rounded-lg shadow-xl overflow-hidden p-6 md:p-8 lg:p-10">
        <h1 className="mb-6 text-center text-3xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {product.title}
        </h1>
        <p className="text-xl font-semibold p-4 pt-2 mt-auto text-gray-400">
          Үнэ: {product.originalPrice && product.originalPrice !== product.price && (<span className='line-through'>{formatPrice(product.originalPrice)}₮</span>)}
           <span> </span><span className='text-black'>{formatPrice(product.price)}₮</span> (НӨАТ ороогүй)
        </p>
        {product.imageCollection && (
          <div className="mb-8 md:mb-10 lg:mb-12">
            <img
              src={product.imageCollection.items[0].url}
              alt={product.title}
              className="w-full h-80 md:h-96 lg:h-[500px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Product Content (Markdown) */}
        <div className="prose prose-lg mx-auto mb-8 text-gray-700 leading-relaxed">
          <Markdown content={product.content} />
        </div>

        {/* Date */}
        <div className="mx-auto max-w-2xl text-right text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
          {/* Assuming Date component exists and formats the date */}
          {product.date && <Date dateString={product.date} />}
        </div>
      </article>

      <hr className="my-16 md:my-20 border-t border-gray-300" />
    </div>
  );
}

export default ProductPage;