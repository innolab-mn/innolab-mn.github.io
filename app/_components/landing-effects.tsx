"use client";

import { useEffect } from "react";

// Scroll reveal, parallax and the store cursor preview from the landing template.
export default function LandingEffects() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal], [data-panel-img]").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    if (!reduced) {
      const layers = document.querySelectorAll<HTMLElement>("[data-parallax]");
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          layers.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const speed = parseFloat(el.dataset.parallax || "0");
              el.style.transform = `translateY(${((window.scrollY * speed) % 600).toFixed(1)}px)`;
            }
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    const preview = document.getElementById("cursor-preview");
    const previewImg = document.getElementById("cursor-preview-img") as HTMLImageElement | null;
    if (preview && previewImg && window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-preview]").forEach((row) => {
        const enter = () => {
          previewImg.src = row.dataset.preview || "";
          preview.classList.remove("opacity-0", "scale-90");
          preview.classList.add("opacity-100", "scale-100");
        };
        const leave = () => {
          preview.classList.add("opacity-0", "scale-90");
          preview.classList.remove("opacity-100", "scale-100");
        };
        const move = (e: MouseEvent) => {
          preview.style.left = `${e.clientX + 28}px`;
          preview.style.top = `${e.clientY - 80}px`;
        };
        row.addEventListener("mouseenter", enter);
        row.addEventListener("mouseleave", leave);
        row.addEventListener("mousemove", move);
        cleanups.push(() => {
          row.removeEventListener("mouseenter", enter);
          row.removeEventListener("mouseleave", leave);
          row.removeEventListener("mousemove", move);
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
