import SiteLayout from "./_components/site-layout";
import NotFoundPage from "./_pages/not-found";
export default function GlobalNotFound() {
  return (
    <SiteLayout locale="mn" notFound>
      <NotFoundPage locale="mn" />
      <p className="container page-content">
        <a className="text-link" href="/en" lang="en">
          Visit the English homepage ↗
        </a>
      </p>
    </SiteLayout>
  );
}
