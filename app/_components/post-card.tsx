import { ArrowUpRight, DISPLAY, formatDate, img } from "@/app/_components/ui";

export default function PostCard({ post, index = 0 }: { post: any; index?: number }) {
  return (
    <a
      href={`/posts/${post.slug}`}
      className="group flex flex-col"
      data-reveal=""
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="rounded-xl overflow-hidden aspect-[16/10] mb-6 shadow-xl shadow-black/10 bg-[#E4EFDA]">
        {post.coverImage?.url && (
          <img src={img(post.coverImage.url, 1000)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        )}
      </div>
      <p className="text-xs text-black/40 mb-3">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.author?.name && <span> · {post.author.name}</span>}
      </p>
      <h3 className={`${DISPLAY} text-xl sm:text-2xl font-light tracking-tighter leading-snug mb-3 group-hover:text-[#1E4D33] transition-colors`}>
        {post.title}
      </h3>
      {post.excerpt && <p className="text-base text-black/55 leading-relaxed line-clamp-2">{post.excerpt}</p>}
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#1E4D33]">
        Унших
        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}
