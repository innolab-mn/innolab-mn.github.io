import Link from "next/link";

import { getAllPosts, getPreviewPostBySlug } from "@/lib/api";
import { Facebook_URL, Youtube_URL } from "@/lib/constants";


export default async function Page() {
  const heroPost = await getPreviewPostBySlug("hero-post");
  const morePosts = await getAllPosts(true);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      {/* <Intro /> */}

      <div className="my-6">
        <Link href="/home">
          <img
            src="/assets/innolab_logo.svg" // Make sure this path is correct and points to a valid image
            alt="InnoLab Visit Site"
            title="InnoLab Visit Site"
            className="w-64 h-auto hover:opacity-80 transition-transform hover:scale-110"
          />
        </Link>
        <nav className="block mt-4">
          <ul className="flex space-x-4 text-center justify-center">
            <li>
              <a
                href="/posts"
                className="bg-white text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 hover:text-black transition"
              >
                Блог
              </a>
            </li>
            <li>
              <a
                href="/courses"
                className="bg-white text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 hover:text-black transition"
              >
                Сургалт
              </a>
            </li>
            <li>
              <a
                href="/products"
                className="bg-white text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 hover:text-black transition"
              >
                Дэлгүүр
              </a>
            </li>
          </ul>
        </nav>

      </div>

      <div className="flex space-x-6">
        <a href={Facebook_URL} target="_blank" rel="noopener noreferrer">
          <img
            src="/assets/facebook.png" // Replace with actual Facebook icon
            alt="InnoLab Facebook Page"
            title="InnoLab Facebook Page"
            className="w-20 h-20 hover:scale-110 transition-transform"
          />
        </a>
        <a href={Youtube_URL} target="_blank" rel="noopener noreferrer">
          <img
            src="/assets/youtube.png" // Replace with actual YouTube icon
            alt="InnoLab Youtube Channel"
            title="InnoLab Youtube Channel"
            className="w-20 h-20 hover:scale-110 transition-transform"
          />
        </a>
      </div>
    </div>

  );
}
Page.getLayout = function getLayout(page:any) {
  return page
}
