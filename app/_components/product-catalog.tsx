"use client";
import { useState } from "react";
import { productCategory } from "@/lib/course-info";
import { ProductCard } from "./cards";
export default function ProductCatalog({ products }: { products: any[] }) {
  const [category, setCategory] = useState("Бүгд");
  const [query, setQuery] = useState("");
  const categories = [
    "Бүгд",
    ...Array.from(new Set(products.map(productCategory))),
  ];
  const filtered = [...products]
    .sort((a, b) => Number(b.price > 0) - Number(a.price > 0))
    .filter(
      (p) =>
        (category === "Бүгд" || productCategory(p) === category) &&
        p.title
          .toLocaleLowerCase("mn")
          .includes(query.toLocaleLowerCase("mn").trim()),
    );
  return (
    <>
      <label className="search-label" htmlFor="product-search">
        Бүтээгдэхүүн хайх
      </label>
      <input
        className="search-input"
        id="product-search"
        type="search"
        placeholder="Нэрээр хайх…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="filter-tabs" aria-label="Бүтээгдэхүүний ангилал">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">
        {filtered.length} бүтээгдэхүүн
      </p>
      {filtered.length ? (
        <div className="shop-grid">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Илэрц олдсонгүй.</h2>
          <p>Хайлтын үг эсвэл ангиллаа өөрчилнө үү.</p>
          <div className="actions">
            <button
              className="button"
              onClick={() => {
                setCategory("Бүгд");
                setQuery("");
              }}
            >
              Бүгдийг харах
            </button>
          </div>
        </div>
      )}
    </>
  );
}
