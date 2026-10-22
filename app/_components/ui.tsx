import { type Locale, translator, localeHref } from "@/lib/i18n";
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
  locale = "mn",
}: {
  price?: number;
  originalPrice?: number;
  tone?: "dark" | "light";
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  if (price == null || price <= 0) return <span>{t("Үнэ лавлах")}</span>;
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
  locale = "mn",
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  external?: boolean;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <a
      className={`button${secondary ? " button-outline" : ""}`}
      href={localeHref(href, locale)}
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
  locale = "mn",
}: {
  href: string;
  children: React.ReactNode;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <a className="text-link" href={localeHref(href, locale)}>
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
  locale = "mn",
}: {
  label: string;
  title: string;
  intro?: string;
  back?: {
    href: string;
    label: string;
  };
  actions?: React.ReactNode;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <header className="page-header">
      <div className="container">
        {back && (
          <nav className="breadcrumbs" aria-label={t("Хуудасны зам")}>
            <a href={localeHref("/", locale)}>{t("Нүүр")}</a>
            <span aria-hidden="true">/</span>
            <a href={localeHref(back.href, locale)}>{t(back.label)}</a>
          </nav>
        )}
        <p className="eyebrow">{t(label)}</p>
        <h1>{t(title)}</h1>
        {intro && <p className="lead">{t(intro)}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </header>
  );
}
export function EmptyState({
  title = "Мэдээлэл удахгүй нэмэгдэнэ.",
  text = "Дэлгэрэнгүй мэдээллийг бидэнтэй холбогдож аваарай.",
  locale = "mn",
}: {
  title?: string;
  text?: string;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <div className="empty-state">
      <h2>{t(title)}</h2>
      <p>{t(text)}</p>
      <div className="actions">
        <Action href="/contact" locale={locale}>
          {t("Холбогдох")}
        </Action>
      </div>
    </div>
  );
}
export function JoinPanel({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <section id="contact" className="section container">
      <div className="join-panel">
        <div>
          <p className="eyebrow">{t("Дараагийн алхам")}</p>
          <h2>
            {t("Таны дараагийн бүтээл")}
            <br />
            {t("эндээс эхэлнэ.")}
          </h2>
          <p>
            {t(
              "Суралцах, турших, эсвэл санаагаа бодит болгох — хамтдаа эхэлцгээе.",
            )}
          </p>
        </div>
        <div className="actions">
          <Action href="/contact" locale={locale}>
            {t("Хамтдаа бүтээе")}
          </Action>
        </div>
      </div>
    </section>
  );
}
export function LandingFooter({
  locale = "mn",
}: {
  locale?: Locale;
} = {}) {
  const t = translator(locale);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href={localeHref("/", locale)} className="brand">
              <img src="/favicon.svg" alt="" width="33" height="33" />
              <span className="brand-name">
                InnoLab<span className="brand-note">Innovation Laboratory</span>
              </span>
            </a>
            <p>
              {t("Санаанаас бодит биет хүртэлх аялал.")}
              <br />
              {t("Технологид дуртай залуусын клуб.")}
            </p>
          </div>
          <div>
            <h3>{t("СУРАЛЦАХ & БҮТЭЭХ")}</h3>
            <ul>
              <li>
                <a href={localeHref("/courses", locale)}>{t("Сургалт")}</a>
              </li>
              <li>
                <a href={localeHref("/projects", locale)}>{t("Төслүүд")}</a>
              </li>
              <li>
                <a href={localeHref("/services", locale)}>{t("Үйлчилгээ")}</a>
              </li>
              <li>
                <a href={localeHref("/products", locale)}>{t("Дэлгүүр")}</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>{t("МАНАЙ КЛУБ")}</h3>
            <ul>
              <li>
                <a href={localeHref("/members", locale)}>
                  {t("Гишүүний булан")}
                </a>
              </li>
              <li>
                <a href={localeHref("/about", locale)}>{t("Бидний тухай")}</a>
              </li>
              <li>
                <a href={localeHref("/activities", locale)}>
                  {t("Үйл ажиллагаа")}
                </a>
              </li>
              <li>
                <a href={localeHref("/posts", locale)}>
                  {t("Мэдээ, тэмдэглэл")}
                </a>
              </li>
              <li>
                <a href={localeHref("/contact", locale)}>{t("Холбогдох")}</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>{t("ХОЛБООТОЙ БАЙЯ")}</h3>
            <ul>
              <li>
                <a href={localeHref(`tel:+976${PHONE}`, locale)}>
                  +976 {PHONE}
                </a>
              </li>
              <li>
                <a
                  href={localeHref(Facebook_CHAT_URL, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Messenger ↗
                </a>
              </li>
              <li>
                <a
                  href={localeHref(Facebook_URL, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook ↗
                </a>
              </li>
              <li>
                <a
                  href={localeHref(Youtube_URL, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {t("InnoLab. Улаанбаатар, Монгол.")}
          </span>
          <span>{t("Суралц. Турш. Бүтээ.")}</span>
        </div>
      </div>
    </footer>
  );
}
