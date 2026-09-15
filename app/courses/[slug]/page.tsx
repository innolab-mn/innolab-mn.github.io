import { notFound } from "next/navigation";
import Date from "../../date";

import { Markdown } from "@/lib/markdown";
import { getAllCourses, getCourseAndMoreCourses } from "@/lib/api";

export const dynamic = "force-static";

import { Metadata } from "next";
import Programs from "../programs";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "placeholder") {
    return {
      title: "Placeholder Course",
      openGraph: {
        title: "Placeholder Course",
        description: "This is a placeholder course.",
        type: "article",
        images: [
          {
            url: "/innolab_logo.svg",
            alt: "Placeholder Course",
          },
        ],
      },
    };
  }

  const data = await getCourseAndMoreCourses(slug, true);

  if (!data?.course) {
    return {
      title: "Course Not Found",
    };
  }

  const { course } = data;

  return {
    title: course.title,
    openGraph: {
      title: course.title,
      description: course.title,
      type: "article",
      images: [
        {
          url: course.coverImage?.url || "/innolab_logo.svg",
          alt: course.title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const courses = await getAllCourses(true);

  if (!courses || courses.length === 0) {
    return [{ slug: "placeholder" }];
  }

  return courses.map((course: any) => ({
    slug: course.slug,
  }));
}

const CoursePage = async ({ params }: Props) => {
  const { slug } = await params;

  if (slug === "placeholder") {
    return <div></div>;
  }

  const data = await getCourseAndMoreCourses(slug, true);

  if (!data?.course) {
    notFound();
  }

  const { course } = data;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <article className="overflow-hidden rounded-lg bg-white p-6 shadow-xl md:p-8 lg:p-10">
        <h1 className="mb-6 text-center text-3xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {course.title}
        </h1>
        {course.price && course.price > 0 && (
          <p className="mt-auto p-4 pt-2 text-xl font-semibold text-gray-400">
            Үнэ: <span className="text-black">{formatPrice(course.price)}₮</span>{" "}
            (НӨАТ ороогүй)
          </p>
        )}
        {course.imageCollection?.items?.[0]?.url && (
          <div className="mb-8 md:mb-10 lg:mb-12">
            <img
              src={course.imageCollection.items[0].url}
              alt={course.title}
              className="h-80 w-full rounded-lg object-cover shadow-md md:h-96 lg:h-[500px]"
            />
          </div>
        )}

        {/* Course Content (Markdown) */}
        <div className="prose prose-lg mx-auto mb-8 text-gray-700 leading-relaxed">
          <Markdown content={course.content} />
        </div>

        {/* Date */}
        <div className="mx-auto mt-6 max-w-2xl border-t border-gray-200 pt-4 text-right text-sm text-gray-500">
          {course.date && <Date dateString={course.date} />}
        </div>
      </article>

      <hr className="my-16 border-t border-gray-300 md:my-20" />
      <Programs />
    </div>
  );
};

export default CoursePage;