import { type Locale, translator, localeHref } from "@/lib/i18n";
import { ArrowUpRight, firstImage, img, Price, formatDate } from "./ui";
import { courseInfo, productCategory } from "@/lib/course-info";
import { AddToCart } from './cart-controls';
export function CourseCard({
  course,
  index = 0,
  locale = "mn",
}: {
  course: any;
  index?: number;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  const info = courseInfo(course);
  return (
    <a
      href={localeHref(`/courses/${course.slug}`, locale)}
      className="course-card"
    >
      <figure
        className={`card-image${/робот/i.test(info.category) ? " contain" : ""}`}
      >
        {firstImage(course) && (
          <img
            src={img(firstImage(course), 800)}
            alt={t(course.title)}
            loading="lazy"
            width="800"
            height="550"
          />
        )}
        <span className="card-index">
          {String(index + 1).padStart(2, "0")} / {t(info.category)}
        </span>
      </figure>
      <div className="card-meta">
        <span>{t(info.duration || "Хугацааг лавлах")}</span>
        <span>{t(info.audience)}</span>
      </div>
      <h3>{t(info.title)}</h3>
      <p>{t(info.summary)}</p>
      <div className="card-bottom">
        <Price
          price={course.price}
          originalPrice={course.originalPrice}
          locale={locale}
        />
        <small>
          {t("Хөтөлбөр үзэх")}
          <ArrowUpRight />
        </small>
      </div>
    </a>
  );
}
export function ProjectCard({
  project,
  locale = "mn",
}: {
  project: any;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <a
      className="project-card"
      href={localeHref(`/projects/${project.slug}`, locale)}
    >
      <figure>
        {firstImage(project) && (
          <img
            src={img(firstImage(project), 1000)}
            alt={t(project.title)}
            loading="lazy"
            width="1000"
            height="688"
          />
        )}
      </figure>
      <h3>
        {t(project.title)}
        <ArrowUpRight />
      </h3>
      <p>{t(project.clientName || "Төслийн зураг, дэлгэрэнгүй")}</p>
    </a>
  );
}
export function ProductCard({
  product,
  locale = "mn",
}: {
  product: any;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <article className="shop-card">
    <a href={localeHref(`/products/${product.slug}`, locale)}>
      <figure>
        {firstImage(product) && (
          <img
            src={img(firstImage(product), 700)}
            alt={t(product.title)}
            loading="lazy"
            width="700"
            height="525"
          />
        )}
      </figure>
      <h3>{t(product.title)}</h3>
      <div className="card-bottom">
        <Price
          price={product.price}
          originalPrice={product.originalPrice}
          locale={locale}
        />
        <ArrowUpRight />
      </div>
      <span className="sr-only">
        {t(productCategory(product))}
        {t("— дэлгэрэнгүй")}
      </span>
    </a>
    <AddToCart product={{slug:product.slug,title:product.title,price:Number(product.price),image:firstImage(product)}} locale={locale}/>
    </article>
  );
}
export function NewsRow({
  post,
  locale = "mn",
}: {
  post: any;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <a href={localeHref(`/posts/${post.slug}`, locale)} className="news-row">
      {post.coverImage?.url ? (
        <img
          src={img(post.coverImage.url, 240)}
          alt=""
          loading="lazy"
          width="110"
          height="85"
        />
      ) : (
        <span />
      )}
      <div>
        <small>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {t("· Мэдээ, тэмдэглэл")}
        </small>
        <h3>{t(post.title)}</h3>
      </div>
      <ArrowUpRight />
    </a>
  );
}
