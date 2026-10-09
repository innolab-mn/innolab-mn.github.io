import { Facebook_CHAT_URL, Facebook_URL, Youtube_URL } from "@/lib/constants";
import {
  Action,
  MODULUS_URL,
  PageHeader,
  PHONE,
  TextLink,
} from "../_components/ui";
export const metadata = {
  title: "Холбогдох, клубт оролцох — InnoLab",
  description:
    "Сургалт, захиалгат макет, 3D хэвлэл, клубийн үйл ажиллагааны талаар холбогдоорой. Утас: 86001161.",
};
export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Дараагийн алхам / Холбогдох"
        title="Таны санааг сонсоё."
        intro="Сургалт сонгох, клубийн үйл ажиллагаанд оролцох, үйлчилгээ эсвэл бүтээгдэхүүний талаар асуух зүйл байвал бидэнтэй холбогдоорой."
      />
      <section className="container contact-grid page-content">
        <div>
          <div className="detail-summary">
            <h2>Юунаас эхлэхээ мэдэхгүй байна уу?</h2>
            <p className="muted">
              Юу сонирхдог, юу хийж сурахыг хүсэж байгаагаа хэлээрэй. Тохирох
              дараагийн алхмаа хамтдаа ярилцъя.
            </p>
            <div className="actions">
              <Action href={Facebook_CHAT_URL} external>
                Messenger-ээр бичих
              </Action>
            </div>
          </div>
          <div className="contact-item">
            <h2>Үйлчилгээний хүсэлт</h2>
            <p>
              Санаа, зориулалт, хэмжээ, байгаа зураг эсвэл файлаа Messenger-ээр
              илгээгээрэй.
            </p>
            <TextLink href="/services">Үйлчилгээтэй танилцах</TextLink>
          </div>
          <div className="contact-item">
            <h2>Сургалт, клубт оролцох</h2>
            <p>
              Сонирхож буй хөтөлбөр, өөрийн түвшин, боломжтой цагаа бидэнд
              хэлээрэй.
            </p>
            <TextLink href="/courses">Хөтөлбөрүүд үзэх</TextLink>
          </div>
        </div>
        <div>
          <div className="contact-item">
            <h2>Утас</h2>
            <a className="text-link" href={`tel:+976${PHONE}`}>
              +976 {PHONE}
            </a>
          </div>
          <div className="contact-item">
            <h2>Хаяг</h2>
            <address>
              Сүхбаатар дүүрэг, M Building #601
              <br />
              Улаанбаатар, Монгол
            </address>
            <p className="note">Ирэхээсээ өмнө утсаар холбогдоорой.</p>
          </div>
          <div className="contact-item">
            <h2>Биднийг дагаарай</h2>
            <div className="actions" style={{ marginTop: 10 }}>
              <TextLink href={Facebook_URL}>Facebook</TextLink>
              <TextLink href={Youtube_URL}>YouTube</TextLink>
            </div>
          </div>
          <div className="contact-item">
            <h2>Төслийн бусад бүтээл</h2>
            <TextLink href={MODULUS_URL}>Modulus</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}
