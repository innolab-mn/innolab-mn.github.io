"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { type Locale, translator, localeHref } from "@/lib/i18n";
import Preferences from "./preferences";
import MemberAccess from "./member-access";
import { CartLink } from './cart-controls';
const links = [
  ["/courses", "Сургалт"],
  ["/projects", "Төслүүд"],
  ["/services", "Үйлчилгээ"],
  ["/products", "Дэлгүүр"],
];
const clubLinks = [
  ["/about", "Бидний тухай"],
  ["/activities", "Үйл ажиллагаа"],
  ["/posts", "Мэдээ, тэмдэглэл"],
  ["/members", "Гишүүний булан"],
];
export default function Navigation({
  locale = "mn",
  notFound = false,
}: {
  locale?: Locale;
  notFound?: boolean;
}) {
  const t = translator(locale);
  const pathname = usePathname().replace(/^\/en(?=\/|$)/, "") || "/";
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    function close(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof MouseEvent &&
        nav.current?.contains(event.target as Node)
      )
        return;
      nav.current
        ?.querySelectorAll<HTMLDetailsElement>("details[open]")
        .forEach((details) => {
          details.open = false;
          if (event instanceof KeyboardEvent)
            details.querySelector("summary")?.focus();
        });
    }
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
  function link([href, label]: string[]) {
    return (
      <a
        key={href}
        href={localeHref(href, locale)}
        aria-current={
          pathname === href || pathname.startsWith(href + "/")
            ? "page"
            : undefined
        }
      >
        {t(label)}
      </a>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("Үндсэн агуулга руу очих")}
      </a>
      <header className="site-header">
        <nav
          ref={nav}
          className="container nav-inner"
          aria-label={t("Үндсэн цэс")}
        >
          <a
            href={localeHref("/", locale)}
            className="brand"
            aria-label={t("InnoLab — Нүүр")}
          >
            <img src="/favicon.svg" alt="" width="33" height="33" />
            <span className="brand-name">
              InnoLab<span className="brand-note">Innovation Laboratory</span>
            </span>
          </a>
          <div className="desktop-nav">
            {links.map(link)}
            <details className="nav-more">
              <summary>
                {t("Клуб")} <span aria-hidden="true">⌄</span>
              </summary>
              <div className="nav-dropdown">{clubLinks.map(link)}</div>
            </details>
          </div>
          <a className="button nav-join" href={localeHref("/contact", locale)}>
            {t("Хамтдаа бүтээе")} <span aria-hidden="true">↗</span>
          </a>
          <MemberAccess locale={locale} />
          <CartLink locale={locale}/>
          <Preferences locale={locale} notFound={notFound} />
          <details className="mobile-menu">
            <summary aria-label={t('Цэс')}>
              <span className="menu-label">{t("Цэс")}</span>{" "}
              <span aria-hidden="true">☰</span>
            </summary>
            <div className="mobile-links">
              {[
                ["/login", "Нэвтрэх"],
                ["/register", "Бүртгүүлэх"],
                ...links,
                ...clubLinks,
                ["/contact", "Холбогдох"],
              ].map(link)}
            </div>
          </details>
        </nav>
      </header>
    </>
  );
}
