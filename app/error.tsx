"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="container loading-state">
      <p className="eyebrow">Мэдээлэл ачаалсангүй</p>
      <h1>Дахин оролдоно уу.</h1>
      <p className="muted" style={{ marginTop: 20 }}>
        Хуудсыг ачаалахад алдаа гарлаа. Түр хүлээгээд дахин оролдоорой.
      </p>
      <div className="actions">
        <button className="button" onClick={reset}>
          Дахин оролдох
        </button>
        <a className="button button-outline" href="/contact">
          Холбогдох
        </a>
      </div>
    </section>
  );
}
