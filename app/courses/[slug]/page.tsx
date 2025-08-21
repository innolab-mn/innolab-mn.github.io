import Date from "../../date";

import { Markdown } from "@/lib/markdown";
import { getAllCourses, getCourseAndMoreCourses } from "@/lib/api";

export const dynamic = "force-static"

import { Metadata } from "next";
import Programs from "../programs";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  if (params.slug === "placeholder") {
    return {
      title: "Placeholder Course",
      openGraph: {
        title: "Placeholder Course",
        description: "This is a placeholder course.",
        type: "article",
        images: [
          {
            url: "/innolab_logo.svg", // fallback if missing
            alt: "Placeholder Course",
          },
        ],
      },
    };
  }
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


  if (!courses || courses.length === 0) {
    return [{ slug: "placeholder" }];
  }

  return courses.map(( course:any) => ({
    slug: course.slug,
  }));
}


const CoursePage = async ({ params }: any) => {
  const { slug } = await params;
  const { course  } = await getCourseAndMoreCourses(slug, true);
  if(slug === "placeholder" || !course) {
    return (<div> </div>)
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-5xl">
  
      <article className="bg-white rounded-lg shadow-xl overflow-hidden p-6 md:p-8 lg:p-10">
        <h1 className="mb-6 text-center text-3xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {course.title}
        </h1>
        { course.price && course.price > 0 && (
        <p className="text-xl font-semibold p-4 pt-2 mt-auto text-gray-400">
          Үнэ: <span className='text-black'>{formatPrice(course.price)}₮</span> (НӨАТ ороогүй)
        </p>)}
        {course.imageCollection && (
          <div className="mb-8 md:mb-10 lg:mb-12">
            <img
              src={course.imageCollection.items[0].url}
              alt={course.title}
              className="w-full h-80 md:h-96 lg:h-[500px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* course Content (Markdown) */}
        <div className="prose prose-lg mx-auto mb-8 text-gray-700 leading-relaxed">
          <Markdown content={course.content} />
        </div>

        {/* Date */}
        <div className="mx-auto max-w-2xl text-right text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
          {/* Assuming Date component exists and formats the date */}
          {course.date && <Date dateString={course.date} />}
        </div>
      </article>

      <hr className="my-16 md:my-20 border-t border-gray-300" />
      <Programs />
    </div>
  );
}

export default CoursePage;