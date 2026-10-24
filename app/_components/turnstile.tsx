"use client";
import { useEffect, useRef, useState } from "react";
import { loadTurnstile, turnstileSiteKey } from "@/lib/turnstile";
import { memberCopy } from "@/lib/member-copy";
import type { Locale } from "@/lib/i18n";

export default function Turnstile({ locale, action, reset, onToken }: {
  locale: Locale; action: "login" | "register" | "forgot"; reset: number;
  onToken: (token: string) => void;
}) {
  const copy = memberCopy(locale);
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const update = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const resize = () => setCompact((host.current?.clientWidth ?? 300) < 300);
    resize();
    const sizeObserver = new ResizeObserver(resize);
    if (host.current) sizeObserver.observe(host.current);
    return () => { observer.disconnect(); sizeObserver.disconnect(); };
  }, []);
  useEffect(() => {
    if (!theme || !host.current) return;
    let active = true;
    let remove: (() => void) | undefined;
    callback.current("");
    setStatus("loading");
    loadTurnstile().then(api => {
      if (!active || !host.current) return;
      const widget = api.render(host.current, {
        sitekey: turnstileSiteKey, theme, size: compact ? "compact" : "flexible", action,
        language: locale === "en" ? "en" : "auto", "response-field": false,
        callback: token => { if (active) { callback.current(token); setStatus("ready"); } },
        "expired-callback": () => { if (active) { callback.current(""); setStatus("expired"); } },
        "timeout-callback": () => { if (active) { callback.current(""); setStatus("expired"); } },
        "error-callback": () => { if (active) { callback.current(""); setStatus("error"); } },
      });
      remove = () => api.remove(widget);
    }).catch(() => { if (active) { callback.current(""); setStatus("error"); } });
    return () => { active = false; callback.current(""); remove?.(); };
  }, [theme, compact, locale, action, reset, attempt]);
  return <div id="auth-captcha" className="auth-captcha" role="group" aria-labelledby="auth-captcha-label" tabIndex={-1}>
    <p id="auth-captcha-label" className="auth-captcha-label">{copy.captchaLabel}</p>
    <div ref={host} className="auth-captcha-widget" />
    <p className={status === "error" ? "auth-captcha-message auth-field-error" : "auth-captcha-message"} role="status" aria-live="polite">
      {status === "ready" ? copy.captchaReady : status === "error" ? copy.captchaFailed : status === "expired" ? copy.captchaExpired : copy.captchaLoading}
    </p>
    {(status === "error" || status === "expired") && <button type="button" className="text-link auth-captcha-retry" onClick={() => setAttempt(value => value + 1)}>{copy.captchaRetry}</button>}
  </div>;
}
