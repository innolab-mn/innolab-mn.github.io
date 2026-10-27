"use client";

import { useEffect, useRef } from "react";

// Keep one copy of the standalone game and its assets in public/fast_read.
export default function FastReadFrame() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let detachGame = () => {};
    const followPage = () => {
      const game = frame.current?.contentWindow;
      const hash = window.location.hash || "#home";
      if (game && game.location.hash !== hash) game.location.hash = hash;
    };
    const connectGame = () => {
      detachGame();
      const game = frame.current?.contentWindow;
      if (!game) return;
      followPage();
      const followGame = () => {
        const hash = game.location.hash || "#home";
        if (window.location.hash !== hash) {
          // The iframe already creates history entries; don't create a second one.
          window.history.replaceState(null, "", hash);
        }
        document.title = game.document.title;
      };
      const title = game.document.querySelector("title");
      const observer = new MutationObserver(followGame);
      if (title) observer.observe(title, { childList: true });
      game.addEventListener("hashchange", followGame);
      followGame();
      detachGame = () => {
        observer.disconnect();
        game.removeEventListener("hashchange", followGame);
      };
    };
    const element = frame.current;
    element?.addEventListener("load", connectGame);
    // Loading can finish before React attaches the listener.
    if (element?.contentDocument?.readyState === "complete" &&
        element.contentWindow?.location.pathname === "/fast_read/index.html") {
      connectGame();
    }
    window.addEventListener("hashchange", followPage);
    return () => {
      element?.removeEventListener("load", connectGame);
      window.removeEventListener("hashchange", followPage);
      detachGame();
    };
  }, []);

  return (
    <main>
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        fast_read — Монгол хүүхдийн унших тоглоом
      </h1>
      <iframe
        ref={frame}
        src="/fast_read/index.html"
        title="fast_read — Үсэг, үг, өгүүлбэр, уншлагын дасгал"
        allow="autoplay; fullscreen"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    </main>
  );
}
