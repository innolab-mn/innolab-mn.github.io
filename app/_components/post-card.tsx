import { type Locale, translator, localeHref } from "@/lib/i18n";
import { ArrowUpRight, formatDate, img } from "./ui";
export default function PostCard({
  post,
  locale = "mn",
}: {
  post: any;
  index?: number;
} & {
  locale?: Locale;
}) {
  const t = translator(locale);
  return (
    <a href={localeHref(`/posts/${post.slug}`, locale)} className="course-card">
      <figure className="card-image">
        {post.coverImage?.url && (
          <img
            src={img(post.coverImage.url, 800)}
            alt={t(post.title)}
            width="800"
            height="550"
            loading="lazy"
          />
        )}
      </figure>
      <div className="card-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.author?.name && <span>{post.author.name}</span>}
      </div>
      <h3>{t(post.title)}</h3>
      {post.excerpt && <p>{t(post.excerpt)}</p>}
      <div className="card-bottom">
        {t("Унших")}
        <ArrowUpRight />
      </div>
    </a>
  );
}
