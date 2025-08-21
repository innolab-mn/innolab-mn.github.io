'use client';
import { Facebook_CHAT_URL } from "@/lib/constants";
import { useState } from "react";

export const dynamic = "force-static"

const logos = [
  { src: "/assets/blender-logo.png", alt: "Blender", desc: "Blender бол нээлттэй эх бүхий, үнэ төлбөргүй 3D загварчлалын програм бөгөөд мэргэжлийн түвшний модел, анимац, визуал эффект, тоглоомын график, дүрс бичлэг, 2D анимэйшн зэргийг бүтээхэд өргөн хэрэглэгддэг. Энэ нь архитектур, инженерчлэл, уран бүтээл, кино урлаг зэрэг олон салбарт ашиглагддаг ба Python хэл дээр суурилсан script-ийн тусламжтайгаар автоматжуулалт хийх боломжтой. Blender нь маш өргөн хамрах хүрээтэй тул шинэхэн суралцагчдаас эхлээд мэргэжлийн хэрэглэгчдэд хүртэл тохиромжтой." },
  { src: "/assets/autodesk-fusion-360-logo.png", alt: "Fusion 360", desc: "Fusion 360 нь Autodesk компанийн бүтээсэн CAD (Computer Aided Design), CAM (Computer Aided Manufacturing), CAE (Computer Aided Engineering) чадварыг нэг дор нэгтгэсэн цогц дизайн програм юм. Энэ нь бүтээгдэхүүний загвар гаргах, симуляци хийх, инженерийн тооцоо хийх, үйлдвэрлэлийн процесс төлөвлөх, 3D хэвлэлд бэлтгэх зэргийг бүгдийг гүйцэтгэх боломжтой. Fusion 360 нь инженер, зохион бүтээгчид, оюутнуудад зориулсан хялбар хэрэглээтэй, хүчирхэг платформ бөгөөд үүлэн систем ашиглан багийн хамтын ажиллагааг хялбарчилдаг." },
  { src: "/assets/python-logo.png", alt: "Python", desc: "Python бол код бичихэд хялбар, уншихад ойлгомжтой, олон талын хэрэглээтэй програмчлалын хэл юм. Вэб хөгжүүлэлт, дата шинжилгээ, хиймэл оюун ухаан, автоматжуулалт, санхүүгийн тооцоолол, тоглоомын хөгжүүлэлт зэрэг олон салбарт өргөн хэрэглэгддэг. Python нь Django, Flask, TensorFlow, PyTorch зэрэг олон алдартай framework болон сангуудтай бөгөөд суралцахад энгийн тул анхан шатны суралцагчдаас эхлээд ахисан түвшний инженерүүд хүртэл ашигладаг." },
  { src: "/assets/unity-logo.png", alt: "Unity 3D", desc: "Unity бол 2D болон 3D тоглоом, виртуал бодит байдал (VR), нэмэгдсэн бодит байдал (AR), симуляци болон хэрэглээний програмуудыг бүтээхэд зориулагдсан, бодит цагийн хөдөлгүүр бүхий платформ юм. Unity нь C# програмчлалын хэлийг ашигладаг бөгөөд олон платформ дээр (Windows, Android, iOS, WebGL, PlayStation, Xbox г.м.) апп гаргах боломжтой. Unity-г ихэвчлэн тоглоом хөгжүүлэгчид ашигладаг боловч боловсрол, инженер, архитектур зэрэг бусад салбарт ч хэрэглэгддэг." },
  { src: "/assets/unreal-engine-logo.png", alt: "Unreal Engine", desc: "Unreal Engine нь Epic Games-ийн бүтээсэн, өндөр чанартай график гаргах чадвартай, бодит цагийн 3D хөдөлгүүр юм. AAA түвшний тоглоомууд, киноны тусгай эффект, виртуал продакшн болон архитектурын визуализацид өргөн хэрэглэгддэг. Unreal Engine нь Blueprints нэртэй кодгүй хөгжүүлэлтийн системтэй бөгөөд програмчлалгүйгээр ч логик загварчлал хийх боломжтой. Гэвч илүү нарийн хяналт хүсвэл C++ програмчлалын хэл ашиглаж болно. Шинэ хувилбар болох UE5 нь Nanite, Lumen зэрэг график шинэчлэлүүдийг агуулсан." },
  { src: "/assets/ros2-logo.png", alt: "ROS2", desc: "ROS2 бол роботын програм хангамжийн архитектурыг стандартчилах зорилгоор бүтээгдсэн нээлттэй эх бүхий middleware платформ юм. Энэ нь олон төрлийн роботын бүрдэл хэсгүүдийг (мотор, сенсор, камерыг) хооронд нь холбож, синхрон ажиллуулах, автономит шийдвэр гаргах, мэдрэгчийн өгөгдөл боловсруулах зэрэг чадамжтай. ROS2 нь хурд, аюулгүй байдал, бодит цагийн ажиллагааг илүү сайжруулсан бөгөөд C++ болон Python хэл дээр хөгжүүлэлт хийдэг." },
  { src: "/assets/arduino-logo.png", alt: "Arduino", desc: "Arduino бол нээлттэй эх бүхий микроконтроллерийн платформ бөгөөд электроник болон робот техник сонирхдог хүн бүрт зориулсан. Arduino-г ашиглан гэрлийн удирдлага, температурын мэдрэгч, робот гар, автоматжуулсан систем гэх мэт төслүүдийг хялбар хөгжүүлж болно. Энэ нь C/C++ дээр суурилсан энгийн програмчлалын орчинтой тул сурахад амархан, хөгжүүлэхэд хурдан байдаг. Arduino нь сургалт, прототип хөгжүүлэлт, инженерчлэлийн эхний алхамд өргөн хэрэглэгддэг." },
  { src: "/assets/raspberry-pi-logo.png", alt: "Raspberry Pi", desc: "Raspberry Pi бол жижиг хэмжээтэй боловч бүрэн хүчин чадалтай компьютер бөгөөд боловсролын зориулалтаар анх бүтээгдсэн ч өдгөө дэлхий даяар maker-ууд, инженерүүдийн гол хэрэгсэл болсон. Raspberry Pi нь Linux үйлдлийн систем ажиллуулж чаддаг бөгөөд Python, Node.js зэрэг хэл дээр програмчлагдаж, IoT төхөөрөмж, автоматжуулалт, робот систем, сервер, медиа төв гэх мэт олон төрлийн төслүүдэд ашиглагддаг." },
  { src: "/assets/nvidia-omniverse-logo.png", alt: "Omniverse", desc: "NVIDIA Omniverse бол 3D симуляци болон бодит цагийн хамтын бүтээл хийх платформ юм. Энэ нь USD (Universal Scene Description)-д суурилсан, олон 3D програм (Blender, Maya, Unreal Engine г.м.)-уудыг холбох боломжтой экосистем юм. Инженер, архитектор, хиймэл оюун ухаан, үйлдвэрлэлийн салбарын мэргэжилтнүүд Omniverse-г ашиглан хамтран 3D орчинд загварчлал, симуляци хийх, физик симуляц болон AI integration хийх боломжтой." },
];

type Logo = {
  src: string;
  alt: string;
  desc: string;
};

const Programs = ({ params }: any) => {

  
  const [active, setActive] = useState<Logo | null>(null);

  return (
    <div className="container mx-auto px-5 max-w-5xl">
      <div className="flex flex-row flex-wrap justify-center items-center gap-8 py-8">
        {logos.map((logo: Logo, index) => (
          <img
            key={index}
            src={logo.src}
            alt={logo.alt}
            className="h-20 cursor-pointer hover:scale-105 transition"
            onClick={() => setActive(logo)}
          />
        ))}
      </div>
      {active && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setActive(null)} // outside click
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
          >
            <button
              className="absolute top-2 right-2 text-gray-500 p-4 text-2xl hover:text-black"
              onClick={() => setActive(null)}
            >
              ✕
            </button>
            <img src={active.src} alt={active.alt} className="h-20 mx-auto mb-4" />
            {/* <h2 className="text-xl font-semibold text-center mb-2">{active.alt}</h2> */}
            <p className="text-gray-700 text-center">{active.desc}</p>
            <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActive(null)}
              className="text-black font-bold hover:underline px-4 py-2 border border-gray-300 rounded-full transition duration-300 hover:bg-gray-100"
            >
              Хаах
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Programs;