"use client";
import { type Locale, translator, localeHref } from "@/lib/i18n";

import { useState } from "react";
import { productCategory } from "@/lib/course-info";
import { ProductCard } from "./cards";
export default function ProductCatalog({
  products,
  locale = "mn",
}: {
  products: any[];
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  const [category, setCategory] = useState(t("Бүгд"));
  const [query, setQuery] = useState("");
  const categories = [
    t("Бүгд"),
    ...Array.from(new Set(products.map(productCategory))),
  ];
  const filtered = [...products]
    .sort((a, b) => Number(b.price > 0) - Number(a.price > 0))
    .filter(
      (p) =>
        (category === t("Бүгд") || productCategory(p) === category) &&
        `${p.title} ${t(p.title)}`
          .toLocaleLowerCase(locale)
          .includes(query.toLocaleLowerCase(locale).trim()),
    );
  return (
    <>
      <label className="search-label" htmlFor="product-search">
        {t("Бүтээгдэхүүн хайх")}
      </label>
      <input
        className="search-input"
        id="product-search"
        type="search"
        placeholder={t("Нэрээр хайх…")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="filter-tabs" aria-label={t("Бүтээгдэхүүний ангилал")}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {t(item)}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">
        {filtered.length} {t("бүтээгдэхүүн")}
      </p>
      {filtered.length ? (
        <div className="shop-grid">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t("Илэрц олдсонгүй.")}</h2>
          <p>{t("Хайлтын үг эсвэл ангиллаа өөрчилнө үү.")}</p>
          <div className="actions">
            <button
              className="button"
              onClick={() => {
                setCategory(t("Бүгд"));
                setQuery("");
              }}
            >
              {t("Бүгдийг харах")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
