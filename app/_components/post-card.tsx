import { ArrowUpRight, formatDate, img } from "./ui";
export default function PostCard({ post }: { post: any; index?: number }) {
  return (
    <a href={`/posts/${post.slug}`} className="course-card">
      <figure className="card-image">
        {post.coverImage?.url && (
          <img
            src={img(post.coverImage.url, 800)}
            alt={post.title}
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
      <h3>{post.title}</h3>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className="card-bottom">
        Унших
        <ArrowUpRight />
      </div>
    </a>
  );
}
