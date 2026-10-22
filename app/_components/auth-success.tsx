"use client";
import { useEffect, useRef } from "react";
import { localeHref, type Locale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member-copy";
import { ArrowUpRight } from "./ui";

export default function AuthSuccess({ locale, kind, email, onEdit }: {
  locale: Locale;
  kind: "registration" | "recovery-email" | "password-updated";
  email?: string;
  onEdit?: () => void;
}) {
  const copy = memberCopy(locale);
  const panel = useRef<HTMLDivElement>(null);
  const updated = kind === "password-updated";
  const recovery = kind === "recovery-email";
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({ block: "start" });
  }, []);
  return (
    <div className="auth-success" ref={panel} tabIndex={-1} role="status" aria-live="polite" aria-labelledby="auth-success-title">
      <div className="auth-success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
          {updated ? <path d="m5 12 4 4L19 6" /> : <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>}
        </svg>
      </div>
      <p className="eyebrow">{updated ? copy.passwordUpdatedBadge : recovery ? copy.resetSentBadge : copy.registrationNextStep}</p>
      <h2 id="auth-success-title">{updated ? copy.passwordUpdated : copy.confirmTitle}</h2>
      <p>{updated ? copy.passwordUpdatedText : recovery ? copy.resetSentText : copy.confirmText}</p>
      {email && <strong className="auth-success-email">{email}</strong>}
      {!updated && <ol>
        <li>{recovery ? copy.resetEmailStep : copy.confirmEmailStep}</li>
        <li>{recovery ? copy.resetLinkStep : copy.confirmLinkStep}</li>
        <li>{recovery ? copy.resetFinishStep : copy.confirmFinishStep}</li>
      </ol>}
      {!updated && <p className="auth-success-help">{copy.emailDeliveryHint}</p>}
      <a className="button" href={localeHref("/login", locale)}>{copy.backToSignIn}<ArrowUpRight /></a>
      {onEdit && <button type="button" className="text-link" onClick={onEdit}>{copy.useAnotherEmail}</button>}
    </div>
  );
}
