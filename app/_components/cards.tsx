import { ArrowUpRight, firstImage, img, Price, formatDate } from "./ui";
import { courseInfo, productCategory } from "@/lib/course-info";
export function CourseCard({
  course,
  index = 0,
}: {
  course: any;
  index?: number;
}) {
  const info = courseInfo(course);
  return (
    <a href={`/courses/${course.slug}`} className="course-card">
      <figure
        className={`card-image${/робот/i.test(info.category) ? " contain" : ""}`}
      >
        {firstImage(course) && (
          <img
            src={img(firstImage(course), 800)}
            alt={course.title}
            loading="lazy"
            width="800"
            height="550"
          />
        )}
        <span className="card-index">
          {String(index + 1).padStart(2, "0")} / {info.category}
        </span>
      </figure>
      <div className="card-meta">
        <span>{info.duration || "Хугацааг лавлах"}</span>
        <span>{info.audience}</span>
      </div>
      <h3>{info.title}</h3>
      <p>{info.summary}</p>
      <div className="card-bottom">
        <Price price={course.price} originalPrice={course.originalPrice} />
        <small>
          Хөтөлбөр үзэх <ArrowUpRight />
        </small>
      </div>
    </a>
  );
}
export function ProjectCard({ project }: { project: any }) {
  return (
    <a className="project-card" href={`/projects/${project.slug}`}>
      <figure>
        {firstImage(project) && (
          <img
            src={img(firstImage(project), 1000)}
            alt={project.title}
            loading="lazy"
            width="1000"
            height="688"
          />
        )}
      </figure>
      <h3>
        {project.title}
        <ArrowUpRight />
      </h3>
      <p>{project.clientName || "Төслийн зураг, дэлгэрэнгүй"}</p>
    </a>
  );
}
export function ProductCard({ product }: { product: any }) {
  return (
    <a href={`/products/${product.slug}`} className="shop-card">
      <figure>
        {firstImage(product) && (
          <img
            src={img(firstImage(product), 700)}
            alt={product.title}
            loading="lazy"
            width="700"
            height="525"
          />
        )}
      </figure>
      <h3>{product.title}</h3>
      <div className="card-bottom">
        <Price price={product.price} originalPrice={product.originalPrice} />
        <ArrowUpRight />
      </div>
      <span className="sr-only">{productCategory(product)} — дэлгэрэнгүй</span>
    </a>
  );
}
export function NewsRow({ post }: { post: any }) {
  return (
    <a href={`/posts/${post.slug}`} className="news-row">
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
          <time dateTime={post.date}>{formatDate(post.date)}</time> · Мэдээ,
          тэмдэглэл
        </small>
        <h3>{post.title}</h3>
      </div>
      <ArrowUpRight />
    </a>
  );
}
