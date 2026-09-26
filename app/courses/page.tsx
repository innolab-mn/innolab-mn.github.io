import type { Metadata } from "next";

import { getAllCourses } from "@/lib/api";
import { Facebook_CHAT_URL } from "@/lib/constants";
import LandingEffects from "@/app/_components/landing-effects";
import { ArrowUpRight, DISPLAY, LandingFooter, LandingNav, PHONE, Price, SERIF, Words, firstImage, img } from "@/app/_components/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Сургалт — InnoLab",
  description: "Blender, Fusion 360, Python, робот програмчлалын танхим болон онлайн сургалтууд.",
};

const TOOLS = [
  { src: "/assets/blender-logo.png", name: "Blender", desc: "Нээлттэй эх бүхий, үнэ төлбөргүй 3D загварчлал, анимацын програм." },
  { src: "/assets/autodesk-fusion-360-logo.png", name: "Fusion 360", desc: "CAD, CAM, CAE чадварыг нэг дор нэгтгэсэн цогц дизайн програм." },
  { src: "/assets/python-logo.png", name: "Python", desc: "Код бичихэд хялбар, олон талын хэрэглээтэй програмчлалын хэл." },
  { src: "/assets/unity-logo.png", name: "Unity", desc: "2D, 3D тоглоом, VR, AR, симуляци бүтээх бодит цагийн хөдөлгүүр." },
  { src: "/assets/unreal-engine-logo.png", name: "Unreal Engine", desc: "Өндөр чанартай график гаргах чадвартай, бодит цагийн 3D хөдөлгүүр." },
  { src: "/assets/ros2-logo.png", name: "ROS2", desc: "Роботын програм хангамжийн нээлттэй эх бүхий middleware платформ." },
  { src: "/assets/arduino-logo.png", name: "Arduino", desc: "Электроник, робот техникт зориулсан нээлттэй микроконтроллер." },
  { src: "/assets/raspberry-pi-logo.png", name: "Raspberry Pi", desc: "Жижиг хэмжээтэй боловч бүрэн хүчин чадалтай компьютер." },
  { src: "/assets/nvidia-omniverse-logo.png", name: "Omniverse", desc: "NVIDIA-ийн 3D симуляци, хамтын бүтээлийн платформ." },
];

export default async function CoursesPage() {
  const courses = (await getAllCourses(false)) ?? [];

  return (
    <>
      <LandingEffects />
      <LandingNav cta={{ href: Facebook_CHAT_URL, label: "Бүртгүүлэх" }} />

      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden pt-32 sm:pt-44 pb-16 sm:pb-24">
        <div className="absolute inset-0 pointer-events-none" data-parallax="0.3">
          <div className="drift-a absolute top-[12%] right-[8%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#42A85D]/15 to-transparent border border-[#1E4D33]/10" />
          <div className="drift-b absolute top-[55%] right-[32%] w-20 h-20 sm:w-28 sm:h-28 rounded-[40%] bg-[#E4EFDA]/80 border border-[#1E4D33]/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end" data-reveal="">
          <div className="lg:col-span-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Сургалт · {courses.length} хөтөлбөр</p>
            <h1 className={`${DISPLAY} text-5xl sm:text-7xl lg:text-8xl leading-[0.95] font-light tracking-tighter`}>
              <Words text="Бүтээж" />
              <em className={SERIF}>
                <Words text="суралц." start={1} />
              </em>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-base sm:text-lg text-black/60 leading-relaxed">
              Танхим болон онлайн хэлбэрээр, 20+ цагийн практик хөтөлбөрүүд. Анхан шатнаас ахисан түвшин хүртэл.
            </p>
            <p className="text-sm text-black/40 mt-3">Үнэд НӨАТ ороогүй.</p>
          </div>
        </div>
      </header>

      {/* ============ COURSE ROWS ============ */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-16 sm:space-y-24">
          {courses.map((course: any, i: number) => {
            const flip = i % 2 === 1;
            return (
              <a key={course.slug} href={`/courses/${course.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center" data-reveal="">
                <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""} rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl shadow-black/15 bg-white`}>
                  {firstImage(course) && (
                    <img data-panel-img="" src={img(firstImage(course), 1600)} alt={course.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                  )}
                </div>
                <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  <p className="text-xs text-[#42A85D] font-medium mb-4">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className={`${DISPLAY} text-3xl sm:text-4xl leading-[1.1] font-light tracking-tighter group-hover:text-[#1E4D33] transition-colors`}>
                    {course.title}
                  </h2>
                  <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-6">
                    <span className={`${DISPLAY} text-2xl font-light tracking-tighter`}>
                      <Price price={course.price} originalPrice={course.originalPrice} />
                    </span>
                    <span className="inline-flex items-center gap-2 bg-[#1E4D33] group-hover:bg-[#2A6647] text-white text-sm font-medium px-5 py-3 rounded-full transition-colors duration-300">
                      Хөтөлбөр үзэх
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ============ TOOLS ============ */}
      <section className="bg-[#E4EFDA] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-14" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E4D33] font-medium mb-6">Технологи</p>
            <h2 className={`${DISPLAY} text-4xl sm:text-5xl font-light tracking-tighter`}>
              <Words text="Бидний ашигладаг" />
              <em className={SERIF}>
                <Words text="хэрэгслүүд" start={2} />
              </em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 rounded-2xl overflow-hidden" data-reveal="">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="bg-[#E4EFDA] hover:bg-white transition-colors duration-500 p-7 sm:p-8 flex items-start gap-5">
                <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white flex items-center justify-center p-2.5 shadow-sm">
                  <img src={tool.src} alt="" className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h3 className={`${DISPLAY} text-xl font-light tracking-tighter mb-1.5`}>{tool.name}</h3>
                  <p className="text-sm text-black/55 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ENROLL ============ */}
      <section className="bg-[#1E4D33] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#42A85D] font-medium mb-6">Бүртгэл</p>
            <h2 className={`${DISPLAY} text-4xl sm:text-6xl leading-[1.05] font-light tracking-tighter text-white`}>
              <Words text="Аль хөтөлбөр" />
              <em className={SERIF}>
                <Words text="тохирох вэ?" start={2} />
              </em>
            </h2>
            <p className="text-lg text-white/60 mt-6 max-w-xl">
              Өөрт тохирох сургалтаа сонгоход тусална. Хуваарь, төлбөрийн нөхцөлийн талаар бидэнтэй холбогдоорой.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-4" data-reveal="" style={{ transitionDelay: "150ms" }}>
            <a href={Facebook_CHAT_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 bg-white hover:bg-[#E4EFDA] active:scale-95 text-[#1E4D33] font-medium text-base px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-black/20">
              Facebook chat
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 border border-white/25 hover:border-white text-white font-medium text-base px-7 py-3.5 rounded-full transition-colors duration-300">
              +976 {PHONE}
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
