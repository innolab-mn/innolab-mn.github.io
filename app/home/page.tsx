import Link from "next/link";
import { draftMode } from "next/headers";

import Date from "../date";
import CoverImage from "../cover-image";
import Avatar from "../avatar";
import MoreStories from "../more-stories";

import { getAllPosts, getPreviewPostBySlug } from "@/lib/api";
import { CMS_NAME, CMS_URL } from "@/lib/constants";

function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-4 md:mb-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight md:pr-8">
        Innovation Laboratory
      </h1>
      <h2 className="text-right md:text-right text-lg mt-5 md:pl-8">
        Future Tech Skills Development
      </h2>
    </section>
  );
}

function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: {
  title: string;
  coverImage: any;
  date: string;
  excerpt: string;
  author: any;
  slug: string;
}) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} slug={slug} url={coverImage.url} />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-6xl leading-tight">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          {/* <div className="mb-4 md:mb-0 text-lg">
            <Date dateString={date} />
          </div> */}
        </div>
        {/* <div>
          <p className="leading-relaxed mb-4">{excerpt}</p>
          {author && <Avatar name={author.name} picture={author.picture} />}
        </div> */}
      </div>
    </section>
  );
}

export default async function Page() {
  const heroPost = await getPreviewPostBySlug("hero-post");
  const morePosts = await getAllPosts(true);
  return (
    <div className="container mx-auto px-5 max-w-5xl">
      <Intro />
      {heroPost && (
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
      )}
      <MoreStories morePosts={morePosts} />
    </div>
  );
}
