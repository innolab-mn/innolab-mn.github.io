import { Facebook_URL, Youtube_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const MODULUS_URL = "https://modulus.hotolarch.com";
export const PHONE = "86001161";

export const DISPLAY = "font-[family-name:var(--font-landing-display)]";
export const SERIF = "font-[family-name:var(--font-landing-serif)] italic font-normal";

// Resize Contentful images through its Images API; formats it can't transform are left as-is.
export function img(url: string | undefined, width: number) {
  if (!url) return undefined;
  return /\.(png|jpe?g|webp)$/i.test(url) ? `${url}?w=${width}&fm=webp&q=80` : url;
}

export function firstImage(entry: any): string | undefined {
  return entry?.imageCollection?.items?.[0]?.url;
}

// Contentful dates carry a local offset; reading the calendar part avoids timezone shifts.
export function formatDate(date?: string) {
  return date ? date.slice(0, 10).replace(/-/g, ".") : "";
}

// Splits text into word spans that blur in once their [data-reveal] ancestor scrolls into view.
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          <span className="word-reveal" style={{ transitionDelay: `${(start + i) * 45}ms` }}>
            {word}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

export function ArrowUpRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

export function LogoMark() {
  return <img src="/favicon.svg" alt="" aria-hidden="true" className="w-6 h-6 shrink-0" />;
}

export function Price({ price, originalPrice, tone = "dark" }: { price?: number; originalPrice?: number; tone?: "dark" | "light" }) {
  if (!price) return null;
  const muted = tone === "dark" ? "text-black/40" : "text-white/40";
  return (
    <span className="whitespace-nowrap">
      {originalPrice && originalPrice !== price && (
        <span className={`line-through mr-2 ${muted}`}>{formatPrice(originalPrice)}₮</span>
      )}
      {formatPrice(price)}₮
    </span>
  );
}

// `home` is "#top" on the landing page itself so the logo scrolls instead of reloading.
export function LandingNav({ home = "/", cta = { href: "/#contact", label: "Холбогдох" } }: { home?: string; cta?: { href: string; label: string } }) {
  const link = "px-3 py-1.5 rounded-full hover:text-black hover:bg-black/5 transition-colors duration-300";
  return (
    <nav className="fixed left-1/2 -translate-x-1/2 top-4 sm:top-7 z-50">
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full pl-4 pr-1.5 py-1.5 border border-black/10 shadow-xl shadow-black/10">
        <a href={home} className="flex items-center gap-2.5 pr-3 sm:pr-4">
          <LogoMark />
          <span className={`${DISPLAY} font-semibold text-sm tracking-tight whitespace-nowrap`}>InnoLab</span>
        </a>
        <div className="hidden md:flex items-center gap-1 text-sm text-black/60">
          <a href="/#about" className={link}>Бидний тухай</a>
          <a href="/courses" className={link}>Сургалт</a>
          <a href="/products" className={link}>Дэлгүүр</a>
          <a href="/posts" className={link}>Блог</a>
        </div>
        <a href={cta.href} className="ml-1 sm:ml-2 bg-[#1E4D33] hover:bg-[#2A6647] active:scale-95 text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-full transition-all duration-300 whitespace-nowrap shadow-lg shadow-[#1E4D33]/30">
          {cta.label}
        </a>
      </div>
    </nav>
  );
}

export function LandingFooter() {
  const link = "hover:text-black transition-colors duration-300";
  return (
    <footer className="border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className={`${DISPLAY} font-semibold text-sm tracking-tight`}>InnoLab</span>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-black/50">
          <a href="/courses" className={link}>Сургалт</a>
          <a href="/products" className={link}>Дэлгүүр</a>
          <a href="/posts" className={link}>Блог</a>
          <a href={Facebook_URL} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a>
          <a href={Youtube_URL} target="_blank" rel="noopener noreferrer" className={link}>YouTube</a>
        </div>
        <p className="text-xs text-black/30">© {new Date().getFullYear()} InnoLab</p>
      </div>
    </footer>
  );
}
