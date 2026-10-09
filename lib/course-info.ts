// Editorial summaries of the existing Contentful syllabi (reviewed 2026-10-09).
// Prices, titles, media and full syllabi remain CMS-driven.
export function courseInfo(course: { title: string; slug: string }) {
  const title = course.title.trim();
  const duration = /python/i.test(title)
    ? "Хугацааг лавлах"
    : title.match(/\(([^)]+цаг)\)/)?.[1];
  const cleanTitle = title.replace(/\s*\([^)]*цаг\)/, "").trim();
  if (/blender/i.test(title))
    return {
      title: cleanTitle,
      category: "3D загварчлал",
      duration,
      audience: /сурагч/.test(title)
        ? "Сурагчдад зориулсан"
        : "3D загварчлал сонирхогчдод",
      summary:
        "Өөрийн 3D загварыг бүтээж, материал, гэрэлтүүлэг, рендерийн үндсийг сураарай.",
      outcomes: [
        "Blender-ийн үндсэн хэрэгслээр 3D загвар бүтээх",
        "Материал, текстур болон гэрэлтүүлэг тохируулах",
        "Cycles, Eevee ашиглан дүрслэл гаргах",
      ],
    };
  if (/SO-ARM|робот/i.test(title))
    return {
      title: cleanTitle,
      category: "Робот техник",
      duration,
      audience: "Робот програмчлал сонирхогчдод",
      summary:
        "Робот гарын хөдөлгөөнийг програмчилж, ROS2, симуляци болон AI-тай ажиллаарай.",
      outcomes: [
        "SO-ARM101 робот гарын хөдөлгөөнийг кодоор удирдах",
        "ROS2 болон IsaacSim орчинд симуляци хийх",
        "Бодит роботыг симуляцийн орчинтой холбож турших",
      ],
    };
  if (/python/i.test(title))
    return {
      title: cleanTitle,
      category: "Програмчлал",
      duration,
      audience: "Програмчлалын суурь сурах хүмүүст",
      summary:
        "Алгоритм, Python хэлний үндсийг сурч, жижиг програмыг өөрөө хэрэгжүүлээрэй.",
      outcomes: [
        "Нөхцөл, давталт, функц ашиглан Python код бичих",
        "Өгөгдлийн бүтэц, хайлт, эрэмбэлэлттэй ажиллах",
        "Жижиг програм бүтээж, алдааг нь шалгах",
      ],
    };
  if (/fusion/i.test(title))
    return {
      title: cleanTitle,
      category: "Инженерийн загварчлал",
      duration,
      audience: "Оюутан, инженер, дизайнеруудад",
      summary:
        "Бүтээгдэхүүн, эд ангиа нарийн хэмжээсээр загварчилж, 3D хэвлэлд бэлтгээрэй.",
      outcomes: [
        "Хэмжээс бүхий 3D загвар бүтээх",
        "Угсралт, хөдөлгөөний суурь симуляци хийх",
        "3D хэвлэх STL, OBJ файл бэлтгэх",
      ],
    };
  return {
    title: cleanTitle,
    category: "Сургалт",
    duration,
    audience: "Хэнд тохирохыг лавлана уу",
    summary: "Хөтөлбөр, агуулга болон бүртгэлийн мэдээлэлтэй танилцаарай.",
    outcomes: [],
  };
}
export function productCategory(product: { title: string; price?: number }) {
  if (/мотор|контроллер/i.test(product.title)) return "Мотор, электроник";
  if (/3D хэвлэл/i.test(product.title)) return "3D хэвлэсэн эд анги";
  if (/робот гар/i.test(product.title)) return "Робот гар";
  return "Бусад бүтээл";
}
