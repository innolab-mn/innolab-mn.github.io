import { Facebook_URL, Youtube_URL } from "@/lib/constants";
import Image from "next/image";

function Header() {
  return (
    <header className="bg-accent-1 border-b border-accent-2">
      <div className="container mx-auto px-5 max-w-5xl">
        <div className="py-6 flex items-center justify-between">
          <a href="/">
            <img src="/assets/innolab_logo.svg" alt="InnoLab Logo" width="149" height="64" />
          </a>

          <input id="menu-toggle" type="checkbox" className="hidden peer" />
          <label htmlFor="menu-toggle" className="md:hidden block cursor-pointer">
            <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-700"></div>
          </label>
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li><a href="/home" className="text-gray-700 hover:text-gray-900">Нүүр</a></li>
              <li><a href="/posts" className="text-gray-700 hover:text-gray-900">Блог</a></li>
              <li><a href="/courses" className="text-gray-700 hover:text-gray-900">Сургалт</a></li>
              <li><a href="/products" className="text-gray-700 hover:text-gray-900">Дэлгүүр</a></li>
              <li><a href={Facebook_URL} className="text-gray-700 hover:text-gray-900"><img height={20} width={20} src="/assets/facebook.png" /></a></li>
              <li><a href={Youtube_URL} className="text-gray-700 hover:text-gray-900"><img height={20} width={20} src="/assets/youtube_no_text.png" /></a></li>
              
            </ul>
          </nav>

          <nav
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out md:hidden"
          >
            <label
              htmlFor="menu-toggle"
              className="absolute top-12 right-12 md:hidden block cursor-pointer z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-700"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <line x1="5" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth={1} />
                <line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth={1} />
              </svg>
            </label>
            <ul className="p-5 space-y-4 pt-20">
              <li><a href="/home" className="text-gray-700 hover:text-gray-900">Нүүр</a></li>
              <li><a href="/posts" className="text-gray-700 hover:text-gray-900">Блог</a></li>
              <li><a href="/courses" className="text-gray-700 hover:text-gray-900">Сургалт</a></li>
              <li><a href="/products" className="text-gray-700 hover:text-gray-900">Дэлгүүр</a></li>
            </ul>
            <div className="center text-center mt-20 flex justify-center space-x-4">
              <a href={Facebook_URL} className="text-gray-700 hover:text-gray-900"><img height={40} width={40} src="/assets/facebook.png" /></a>
              <a href={Youtube_URL} className="text-gray-700 hover:text-gray-900"><img height={40} width={40} src="/assets/youtube_no_text.png" /></a>
            </div>

            <div className="absolute bottom-6 left-0 w-full px-5">
              <address className="not-italic text-center text-gray-600 text-sm leading-relaxed">
              <a href="tel:86001161" className="text-blue-600 hover:text-blue-800 underline">
                +97686001161
              </a>{" "}
              – Chingeltei, 3-р хороо, Pearl Tower, Corp B #504,
              <br />
              Ulaanbaatar, Mongolia
              </address>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
<footer className="bg-accent-1 border-t border-accent-2">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="py-12 flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
      <Image
        src="/assets/innolab_logo.svg"
        alt="InnoLab Logo"
        width={149}
        height={64}
        unoptimized
        className="h-auto w-[149px]"
      />

      <address className="not-italic text-center lg:text-right text-gray-600 text-sm leading-relaxed">
        © {new Date().getFullYear()} <strong>InnoLab</strong>. All rights reserved.
        <br />
        <a href="tel:86001161" className="text-blue-600 hover:text-blue-800 underline">
          +97686001161
        </a>{" "}
        – Chingeltei, 3-р хороо, Pearl Tower, Corp B #504,
        <br />
        Ulaanbaatar, Mongolia
      </address>
    </div>
  </div>
</footer>
  );
}
export {Header, Footer}
