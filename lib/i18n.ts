import english from "./locales/en.json";

export type Locale = "mn" | "en";
export type LocaleProps = { locale?: Locale };
const dictionary: Record<string, string> = english;
export const normalizeText = (value: string) =>
  value.replace(/\s+/g, " ").trim();

export function translator(locale: Locale) {
  return (value: string): string => {
    if (locale === "mn" || !value) return value;
    const key = normalizeText(value);
    if (dictionary[key]) return dictionary[key];
    // CMS titles also appear without their parenthesized duration on cards.
    const withoutDuration = key.replace(/\s*\([^)]*цаг\)/, "").trim();
    if (dictionary[withoutDuration]) return dictionary[withoutDuration];
    const suffix = key.match(/^(.*?) — (InnoLab(?: төсөл| дэлгүүр)?)$/);
    if (suffix) return `${translator(locale)(suffix[1])} — InnoLab`;
    return key.replace(/(\d+\+?) цаг/g, "$1 hours");
  };
}

export function localeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const clean = href.replace(/^\/en(?=\/|$|[?#])/, "") || "/";
  return locale === "en" ? `/en${clean === "/" ? "" : clean}` : clean;
}

export function translatedMetadata(
  metadata: any,
  locale: Locale,
  route: string,
) {
  const t = translator(locale);
  return {
    ...metadata,
    title: metadata?.title
      ? t(metadata.title)
      : t("InnoLab — Суралц. Турш. Бүтээ."),
    description: metadata?.description ? t(metadata.description) : undefined,
    openGraph: metadata?.openGraph
      ? {
          ...metadata.openGraph,
          title: metadata.openGraph.title
            ? t(metadata.openGraph.title)
            : undefined,
          description: metadata.openGraph.description
            ? t(metadata.openGraph.description)
            : undefined,
          locale: locale === "en" ? "en_US" : "mn_MN",
        }
      : undefined,
    alternates: {
      canonical: localeHref(route, locale),
      languages: { mn: localeHref(route, "mn"), en: localeHref(route, "en") },
    },
  };
}
