import { Action, PageHeader } from "./_components/ui";
export default function NotFound() {
  return (
    <>
      <PageHeader
        label="404 / Хуудас олдсонгүй"
        title="Энэ хуудас олдсонгүй."
        intro="Холбоос өөрчлөгдсөн эсвэл хуудас байхгүй байна. Үндсэн хэсгүүдээс үргэлжлүүлээрэй."
      />
      <div className="container page-content actions">
        <Action href="/courses">Сургалт үзэх</Action>
        <Action href="/" secondary>
          Нүүр хуудас
        </Action>
      </div>
    </>
  );
}
