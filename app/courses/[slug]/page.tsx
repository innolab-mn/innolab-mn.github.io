import Link from "next/link";

import Date from "../../date";

import { Markdown } from "@/lib/markdown";
import { getAllCourses, getCourseAndMoreCourses } from "@/lib/api";

export const dynamic = "force-static"

import { Metadata } from "next";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { course } = await getCourseAndMoreCourses(params.slug, true);

  return {
    title: course.title,
    openGraph: {
      title: course.title,
      description: course.title,
      type: "article",
      images: [
        {
          url: course.coverImage?.url || "/innolab_logo.svg", // fallback if missing
          alt: course.title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const courses = await getAllCourses(true);

  return courses.map(( course:any) => ({
    slug: course.slug,
  }));
}


const CourcePage = async ({ params }: any) => {
  const { slug } = await params;
  const { course  } = await getCourseAndMoreCourses(slug, true);

  return (
    <div className="container mx-auto px-5 max-w-5xl">
      <article>
        <h1 className="mb-12 text-center text-3xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
          {course.title}
        </h1>
        <Markdown content={course.content} />
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-lg">
            <Date dateString={course.date} />
          </div>
        </div>
      </article>
      <hr className="border-accent-2 mt-28 mb-24" />
    </div>
  );
}

export default CourcePage;