"use client";
import { type Locale, translator, localeHref } from "@/lib/i18n";

import { useState } from "react";
// Main product photo with thumbnails when a product has more than one image.
export default function Gallery({
  images,
  title,
  locale = "mn",
}: {
  images: string[];
  title: string;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  const [active, setActive] = useState(0);
  if (images.length === 0)
    return (
      <div className="empty-state">
        <p>{t("Бүтээгдэхүүний зураг хараахан нэмэгдээгүй байна.")}</p>
      </div>
    );
  return (
    <div>
      <div className="relative rounded overflow-hidden aspect-square sm:aspect-[4/3] bg-white border border-black/10">
        <img
          src={images[active]}
          alt={`${t(title)} — ${locale === "en" ? "image" : "зураг"} ${active + 1}`}
          width="1200"
          height="900"
          className="w-full h-full object-contain p-6 sm:p-10"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${t(title)} — ${locale === "en" ? "image" : "зураг"} ${i + 1}`}
              aria-current={i === active}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white border transition-colors duration-300 ${i === active ? "border-[var(--green)]" : "border-black/10 hover:border-black/30"}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
