import { notFound } from "next/navigation";
import * as Home from "@/app/_pages/home";
import * as About from "@/app/_pages/about";
import * as Activities from "@/app/_pages/activities";
import * as Contact from "@/app/_pages/contact";
import * as Courses from "@/app/_pages/courses";
import * as Course from "@/app/_pages/course-detail";
import * as Products from "@/app/_pages/products";
import * as Product from "@/app/_pages/product-detail";
import * as Projects from "@/app/_pages/projects";
import * as Project from "@/app/_pages/project-detail";
import * as Posts from "@/app/_pages/posts";
import * as Post from "@/app/_pages/post-detail";
import * as Services from "@/app/_pages/services";
import * as Login from "@/app/_pages/login";
import * as Register from "@/app/_pages/register";
import * as Members from "@/app/_pages/members";
import * as ForgotPassword from "@/app/_pages/forgot-password";
import * as ResetPassword from "@/app/_pages/reset-password";
import { translatedMetadata } from "@/lib/i18n";

export const dynamic = "force-static";
export const dynamicParams = false;
const sections: Record<string, any> = {
  "": Home,
  about: About,
  activities: Activities,
  contact: Contact,
  courses: Courses,
  products: Products,
  projects: Projects,
  posts: Posts,
  services: Services,
  login: Login,
  register: Register,
  members: Members,
  "forgot-password": ForgotPassword,
  "reset-password": ResetPassword,
};
const details: Record<string, any> = {
  courses: Course,
  products: Product,
  projects: Project,
  posts: Post,
};
type Props = { params: Promise<{ path?: string[] }> };
function resolve(parts: string[]) {
  return parts.length <= 1
    ? sections[parts[0] || ""]
    : parts.length === 2
      ? details[parts[0]]
      : undefined;
}
export async function generateStaticParams() {
  const routes: { path: string[] }[] = Object.keys(sections).map((section) => ({
    path: section ? [section] : [],
  }));
  for (const [section, source] of Object.entries(details)) {
    for (const entry of await source.generateStaticParams())
      routes.push({ path: [section, entry.slug] });
  }
  return routes;
}
export async function generateMetadata({ params }: Props) {
  const { path = [] } = await params;
  const source = resolve(path);
  if (!source) return { title: "Page not found — InnoLab" };
  const metadata = source.generateMetadata
    ? await source.generateMetadata({
        params: Promise.resolve({ slug: path[1] }),
      })
    : source.metadata;
  return translatedMetadata(metadata, "en", "/" + path.join("/"));
}
export default async function EnglishPage({ params }: Props) {
  const { path = [] } = await params;
  const source = resolve(path);
  if (!source) notFound();
  return source.default({
    locale: "en",
    params: Promise.resolve({ slug: path[1] }),
  });
}
