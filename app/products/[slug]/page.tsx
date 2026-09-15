import { notFound } from "next/navigation";
import Date from "../../date";

import { Markdown } from "@/lib/markdown";
import { getAllProducts, getProductAndMoreProducts } from "@/lib/api";

export const dynamic = "force-static";

import { Metadata } from "next";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "placeholder") {
    return {
      title: "Placeholder Product",
      openGraph: {
        title: "Placeholder Product",
        description: "This is a placeholder product.",
        type: "article",
        images: [
          {
            url: "/innolab_logo.svg",
            alt: "Placeholder Product",
          },
        ],
      },
    };
  }

  const data = await getProductAndMoreProducts(slug, false);

  if (!data?.product) {
    return {
      title: "Product Not Found",
    };
  }

  const { product } = data;

  return {
    title: product.title,
    openGraph: {
      title: product.title,
      description: product.title,
      type: "article",
      images: [
        {
          url: product.coverImage?.url || "/innolab_logo.svg",
          alt: product.title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const products = await getAllProducts(true);

  if (!products || products.length === 0) {
    return [{ slug: "placeholder" }];
  }

  return products.map((product: any) => ({
    slug: product.slug,
  }));
}

const ProductPage = async ({ params }: Props) => {
  const { slug } = await params;

  if (slug === "placeholder") {
    return <div></div>;
  }

  const data = await getProductAndMoreProducts(slug, false);

  if (!data?.product) {
    notFound();
  }

  const { product } = data;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <article className="overflow-hidden rounded-lg bg-white p-6 shadow-xl md:p-8 lg:p-10">
        <h1 className="mb-6 text-center text-3xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {product.title}
        </h1>
        <p className="mt-auto p-4 pt-2 text-xl font-semibold text-gray-400">
          Үнэ:{" "}
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="line-through">
              {formatPrice(product.originalPrice)}₮
            </span>
          )}
          <span> </span>
          <span className="text-black">{formatPrice(product.price)}₮</span> (НӨАТ
          ороогүй)
        </p>
        {product.imageCollection?.items?.[0]?.url && (
          <div className="mb-8 md:mb-10 lg:mb-12">
            <img
              src={product.imageCollection.items[0].url}
              alt={product.title}
              className="h-80 w-full rounded-lg object-cover shadow-md md:h-96 lg:h-[500px]"
            />
          </div>
        )}

        {/* Product Content (Markdown) */}
        <div className="prose prose-lg mx-auto mb-8 text-gray-700 leading-relaxed">
          <Markdown content={product.content} />
        </div>

        {/* Date */}
        <div className="mx-auto mt-6 max-w-2xl border-t border-gray-200 pt-4 text-right text-sm text-gray-500">
          {product.date && <Date dateString={product.date} />}
        </div>
      </article>

      <hr className="my-16 border-t border-gray-300 md:my-20" />
    </div>
  );
};

export default ProductPage;