"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
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
];
export default function Navigation() {
  const pathname = usePathname();
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
        href={href}
        aria-current={
          pathname === href || pathname.startsWith(href + "/")
            ? "page"
            : undefined
        }
      >
        {label}
      </a>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        Үндсэн агуулга руу очих
      </a>
      <header className="site-header">
        <nav ref={nav} className="container nav-inner" aria-label="Үндсэн цэс">
          <a href="/" className="brand" aria-label="InnoLab — Нүүр">
            <img src="/favicon.svg" alt="" width="33" height="33" />
            <span className="brand-name">
              InnoLab<span className="brand-note">Innovation Laboratory</span>
            </span>
          </a>
          <div className="desktop-nav">
            {links.map(link)}
            <details className="nav-more">
              <summary>
                Клуб <span aria-hidden="true">⌄</span>
              </summary>
              <div className="nav-dropdown">{clubLinks.map(link)}</div>
            </details>
          </div>
          <a className="button nav-join" href="/contact">
            Хамтдаа бүтээе <span aria-hidden="true">↗</span>
          </a>
          <details className="mobile-menu">
            <summary>
              Цэс <span aria-hidden="true">☰</span>
            </summary>
            <div className="mobile-links">
              {[...links, ...clubLinks, ["/contact", "Холбогдох"]].map(link)}
            </div>
          </details>
        </nav>
      </header>
    </>
  );
}
