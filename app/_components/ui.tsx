import { Facebook_URL, Youtube_URL, Facebook_CHAT_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
export const MODULUS_URL = "https://modulus.hotolarch.com";
export const PHONE = "86001161";
export const DISPLAY = "font-[family-name:var(--font-landing-display)]";
export const SERIF = "font-normal";

export function img(url: string | undefined, width: number) {
  if (!url) return undefined;
  try {
    const source = new URL(url);
    if (
      source.hostname === "images.ctfassets.net" &&
      /\.(png|jpe?g|webp|avif)$/i.test(source.pathname)
    ) {
      source.searchParams.set("w", String(width));
      source.searchParams.set("fm", "webp");
      source.searchParams.set("q", "80");
      return source.toString();
    }
  } catch {
    return url;
  }
  return url;
}
export function firstImage(entry: any): string | undefined {
  return entry?.imageCollection?.items?.find((item: any) => item?.url)?.url;
}
export function formatDate(date?: string) {
  return date ? date.slice(0, 10).replace(/-/g, ".") : "";
}
export function Words({ text }: { text: string; start?: number }) {
  return <>{text}</>;
}
export function ArrowUpRight({ className = "arrow" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
export function Price({
  price,
  originalPrice,
}: {
  price?: number;
  originalPrice?: number;
  tone?: "dark" | "light";
}) {
  if (price == null || price <= 0) return <span>Үнэ лавлах</span>;
  return (
    <span>
      {originalPrice && originalPrice > price ? (
        <del className="muted" style={{ fontSize: ".8em", marginRight: 8 }}>
          {formatPrice(originalPrice)}₮
        </del>
      ) : null}
      {formatPrice(price)}₮
    </span>
  );
}
export function Action({
  href,
  children,
  secondary = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  external?: boolean;
}) {
  return (
    <a
      className={`button${secondary ? " button-outline" : ""}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <ArrowUpRight />
    </a>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowUpRight />
    </a>
  );
}
export function PageHeader({
  label,
  title,
  intro,
  back,
  actions,
}: {
  label: string;
  title: string;
  intro?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="container">
        {back && (
          <nav className="breadcrumbs" aria-label="Хуудасны зам">
            <a href="/">Нүүр</a>
            <span aria-hidden="true">/</span>
            <a href={back.href}>{back.label}</a>
          </nav>
        )}
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </header>
  );
}
export function EmptyState({
  title = "Мэдээлэл удахгүй нэмэгдэнэ.",
  text = "Дэлгэрэнгүй мэдээллийг бидэнтэй холбогдож аваарай.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="actions">
        <Action href="/contact">Холбогдох</Action>
      </div>
    </div>
  );
}
export function JoinPanel() {
  return (
    <section id="contact" className="section container">
      <div className="join-panel">
        <div>
          <p className="eyebrow">Дараагийн алхам</p>
          <h2>
            Таны дараагийн бүтээл
            <br />
            эндээс эхэлнэ.
          </h2>
          <p>
            Суралцах, турших, эсвэл санаагаа бодит болгох — хамтдаа эхэлцгээе.
          </p>
        </div>
        <div className="actions">
          <Action href="/contact">Хамтдаа бүтээе</Action>
        </div>
      </div>
    </section>
  );
}
export function LandingFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="/" className="brand">
              <img src="/favicon.svg" alt="" width="33" height="33" />
              <span className="brand-name">
                InnoLab<span className="brand-note">Innovation Laboratory</span>
              </span>
            </a>
            <p>
              Санаанаас бодит биет хүртэлх аялал.
              <br />
              Технологид дуртай залуусын клуб.
            </p>
          </div>
          <div>
            <h3>СУРАЛЦАХ & БҮТЭЭХ</h3>
            <ul>
              <li>
                <a href="/courses">Сургалт</a>
              </li>
              <li>
                <a href="/projects">Төслүүд</a>
              </li>
              <li>
                <a href="/services">Үйлчилгээ</a>
              </li>
              <li>
                <a href="/products">Дэлгүүр</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>МАНАЙ КЛУБ</h3>
            <ul>
              <li>
                <a href="/about">Бидний тухай</a>
              </li>
              <li>
                <a href="/activities">Үйл ажиллагаа</a>
              </li>
              <li>
                <a href="/posts">Мэдээ, тэмдэглэл</a>
              </li>
              <li>
                <a href="/contact">Холбогдох</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>ХОЛБООТОЙ БАЙЯ</h3>
            <ul>
              <li>
                <a href={`tel:+976${PHONE}`}>+976 {PHONE}</a>
              </li>
              <li>
                <a
                  href={Facebook_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Messenger ↗
                </a>
              </li>
              <li>
                <a
                  href={Facebook_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook ↗
                </a>
              </li>
              <li>
                <a href={Youtube_URL} target="_blank" rel="noopener noreferrer">
                  YouTube ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} InnoLab. Улаанбаатар, Монгол.
          </span>
          <span>Суралц. Турш. Бүтээ.</span>
        </div>
      </div>
    </footer>
  );
}
