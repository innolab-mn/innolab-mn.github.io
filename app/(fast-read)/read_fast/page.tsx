import type { Metadata } from "next";
import FastReadFrame from "./fast-read-frame";

export const metadata: Metadata = {
  title: "fast_read — Тоглонгоо уншиж суръя",
  description:
    "Монгол хүүхдэд зориулсан үсэг, үг, өгүүлбэрийн тоглоом, 60 эхтэй уншлагын дасгал.",
  icons: { icon: "/fast_read/assets/favicon.svg" },
};

export default function FastReadPage() {
  return <FastReadFrame />;
}
