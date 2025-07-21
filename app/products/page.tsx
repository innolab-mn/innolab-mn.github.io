import Link from 'next/link'; // Import the Link component
import { getAllProducts } from "@/lib/api";
import { Facebook_CHAT_URL } from '@/lib/constants';

export const dynamic = "force-static";

// Helper function to format the price
const formatPrice = (price: Number) => {
  // Convert to string and add apostrophe every three digits from the end
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
};

const ProductPreview = ({ product }: any) => {
  const formattedPrice = formatPrice(product.price);

  return (
    // Wrap the entire product card content with Link
    <Link href={`/products/${product.slug}`} passHref>
      {/* The `div` now acts as the clickable area, styled as a card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition duration-300 hover:scale-105 cursor-pointer">
        <h2 className="text-lg sm:text-xl font-bold p-4 pb-0 text-gray-800">
          {product.title}
        </h2>
        {product.imageCollection && (
          <img
            src={product.imageCollection.items[0].url}
            alt={product.title}
            className="w-full h-48 object-cover mt-2"
          />
        )}
        <p className="text-xl font-semibold p-4 pt-2 mt-auto text-gray-400">
          Үнэ: {product.originalPrice && product.originalPrice !== product.price && (<span className='line-through'>{formatPrice(product.originalPrice)}₮</span>)}
           <span> </span><span className='text-black'>{formatPrice(product.price)}₮</span>
        </p>
      </div>
    </Link>
  );
};

const ProductPage = async ({ params }: any) => {
  const products = await getAllProducts(true);
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">
        Та <a href="tel:86001161" className="text-blue-600 ml-1 hover:text-blue-800">86001161</a> дугаар руу холбогдох эсвэл 
        <span> </span><a href={Facebook_CHAT_URL} className='text-blue-600 ml-1 hover:text-blue-800'>Facebook chat</a>-аас дэлгэрэнгүй мэдээлэл авна уу.
      </h1>
      <p className="text-base text-gray-700 mb-6">
        Бидний үйл ажиллагааг дэмжин худалдан авалт хийсэнд баярлалаа.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <ProductPreview key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductPage;