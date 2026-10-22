"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { localeHref, type Locale } from "@/lib/i18n";

type Theme = "system" | "light" | "dark";
const nextTheme: Record<Theme, Theme> = {
  system: "dark",
  dark: "light",
  light: "system",
};

export default function Preferences({
  locale,
  notFound = false,
}: {
  locale: Locale;
  notFound?: boolean;
}) {
  const currentPath = usePathname();
  const pathname = notFound ? "/" : currentPath;
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function apply(preference: Theme) {
      document.documentElement.dataset.theme =
        preference === "dark" || (preference === "system" && media.matches)
          ? "dark"
          : "light";
      document.documentElement.dataset.themePreference = preference;
      setTheme(preference);
    }
    const current = () => {
      try {
        const saved = localStorage.getItem("innolab-theme");
        return saved === "light" || saved === "dark" ? saved : "system";
      } catch {
        return "system";
      }
    };
    apply(current());
    const changed = () => apply(current());
    media.addEventListener("change", changed);
    window.addEventListener("storage", changed);
    return () => {
      media.removeEventListener("change", changed);
      window.removeEventListener("storage", changed);
    };
  }, []);
  const names =
    locale === "en"
      ? { system: "System", light: "Light", dark: "Dark" }
      : { system: "Систем", light: "Гэрэлтэй", dark: "Харанхуй" };
  const label =
    locale === "en"
      ? `Theme: ${names[theme]}. Switch to ${names[nextTheme[theme]]}.`
      : `Өнгө: ${names[theme]}. ${names[nextTheme[theme]]} болгох.`;
  function toggleTheme() {
    const next = nextTheme[theme];
    setTheme(next);
    try {
      localStorage.setItem("innolab-theme", next);
    } catch {
      /* Session choice still works when storage is unavailable. */
    }
    document.documentElement.dataset.themePreference = next;
    document.documentElement.dataset.theme =
      next === "dark" ||
      (next === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
  }
  const targetLocale = locale === "en" ? "mn" : "en";
  return (
    <div
      className="site-preferences"
      aria-label={locale === "en" ? "Language and appearance" : "Хэл ба өнгө"}
    >
      <a
        className="preference-control language-control"
        href={localeHref(pathname, targetLocale)}
        hrefLang={targetLocale}
        lang={targetLocale}
        aria-label={
          targetLocale === "en"
            ? "Read this page in English"
            : "Энэ хуудсыг монгол хэлээр үзэх"
        }
        onClick={(event) => {
          const url = new URL(event.currentTarget.href);
          url.search = location.search;
          url.hash = location.hash;
          event.currentTarget.href = url.toString();
        }}
      >
        {targetLocale === "en" ? "EN" : "MN"}
      </a>
      <button
        type="button"
        className="preference-control theme-control"
        aria-label={label}
        title={label}
        onClick={toggleTheme}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {theme === "dark" ? (
            <path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5 8.5 8.5 0 1 0 20.5 13.2Z" />
          ) : theme === "light" ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <>
              <rect x="3" y="4" width="18" height="13" rx="2" />
              <path d="M8 21h8m-4-4v4" />
            </>
          )}
        </svg>
      </button>
      <span className="sr-only" role="status">
        {locale === "en" ? `Theme: ${names[theme]}` : `Өнгө: ${names[theme]}`}
      </span>
    </div>
  );
}
