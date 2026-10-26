"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { type Locale, translator, localeHref } from "@/lib/i18n";
import Preferences from "./preferences";
import MemberAccess from "./member-access";
import { CartLink } from './cart-controls';
import { useMember } from './use-member';
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
  const { member } = useMember();
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
              <summary className={clubLinks.some(([href]) => pathname === href || pathname.startsWith(href + '/')) ? 'is-current' : undefined}>
                {t("Клуб")} <span aria-hidden="true">⌄</span>
              </summary>
              <div className="nav-dropdown"><p className="nav-group-label">{locale === 'en' ? 'Explore the club' : 'Клубтэй танилцах'}</p>{clubLinks.map(link)}{link(['/contact', 'Холбогдох'])}</div>
            </details>
          </div>
          <div className="header-tools">
          <CartLink locale={locale}/>
          <Preferences locale={locale} notFound={notFound} />
          <MemberAccess locale={locale} />
          </div>
          <details className="mobile-menu">
            <summary aria-label={t('Цэс')}>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span className="sr-only">{t("Цэс")}</span>
            </summary>
            <div className="mobile-links">
              <p className="nav-group-label">{locale === 'en' ? 'Learn. Build. Belong.' : 'Суралц. Бүтээ. Нэгд.'}</p>
              <div className="mobile-primary-links">{links.map(link)}</div>
              <div className="mobile-secondary-links">{clubLinks.map(link)}{link(['/contact', 'Холбогдох'])}</div>
              <div className="mobile-account-links">{member ? <>{link(['/members', 'Гишүүний булан'])}{member.role !== 'member' && <a href={localeHref('/admin', locale)}>{locale === 'en' ? 'Administration' : 'Удирдлага'} ↗</a>}</> : <>{link(['/login', 'Нэвтрэх'])}{link(['/register', 'Бүртгүүлэх'])}</>}</div>
            </div>
          </details>
        </nav>
      </header>
    </>
  );
}
