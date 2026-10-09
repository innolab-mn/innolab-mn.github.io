export default function Loading() {
  return (
    <div className="container loading-state" role="status">
      <p className="eyebrow">InnoLab</p>
      <h2>Мэдээлэл ачаалж байна…</h2>
      <div className="loading-bar" aria-hidden="true" />
    </div>
  );
}
