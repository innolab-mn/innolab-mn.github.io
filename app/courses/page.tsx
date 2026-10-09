import { getAllCourses } from "@/lib/api";
import { CourseCard } from "../_components/cards";
import { EmptyState, JoinPanel, PageHeader } from "../_components/ui";
export const dynamic = "force-static";
export const metadata = {
  title: "Сургалт — InnoLab",
  description:
    "3D загварчлал, Python, робот програмчлалын сургалт. Хөтөлбөр, төлбөр болон суралцах үр дүнтэй танилцаарай.",
};
export default async function CoursesPage() {
  const courses = await getAllCourses(false);
  return (
    <>
      <PageHeader
        label="Суралцах / Сургалт"
        title="Сонирхлоо ур чадвар болго."
        intro="Сурсан зүйлээ өөрөө хийж турших хөтөлбөрүүд. 3D загварчлал, програмчлал, робот техникээс өөрийн чиглэлээ сонгоорой."
      />
      <section
        className="container page-content"
        aria-label="Сургалтын хөтөлбөрүүд"
      >
        <h2 className="sr-only">Сургалтын хөтөлбөрүүд</h2>
        {courses.length ? (
          <div className="course-grid">
            {courses.map((course: any, index: number) => (
              <CourseCard key={course.slug} course={course} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="Сургалтын мэдээлэл удахгүй нэмэгдэнэ." />
        )}
        <p className="note">
          Үнэд НӨАТ ороогүй. Хуваарь, сургалтын хэлбэр, урьдчилсан шаардлагыг
          бүртгүүлэхээсээ өмнө лавлана уу.
        </p>
      </section>
      <section className="section section-tint">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Суралцах хэрэгслүүд</p>
              <h2>Санаагаа хэрэгжүүлэх технологи.</h2>
            </div>
          </div>
          <div className="discipline-strip" style={{ marginTop: 0 }}>
            {[
              ["blender-logo.png", "Blender"],
              ["autodesk-fusion-360-logo.png", "Fusion 360"],
              ["python-logo.png", "Python"],
              ["ros2-logo.png", "ROS2"],
            ].map(([src, name]) => (
              <span key={name}>
                <img
                  src={`/assets/${src}`}
                  alt=""
                  width="30"
                  height="30"
                  loading="lazy"
                  style={{ objectFit: "contain", height: 30 }}
                />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
      <JoinPanel />
    </>
  );
}
