"use client";
import { localeHref, type Locale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member-copy";
import { useMember } from "./use-member";

export default function MemberAccess({ locale }: { locale: Locale }) {
  const { member } = useMember();
  const copy = memberCopy(locale);
  const label = member ? copy.memberArea : copy.signIn;
  return (
    <a
      className="member-access"
      href={localeHref(member ? "/members" : "/login", locale)}
      aria-label={label}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </svg>
      <span>{label}</span>
    </a>
  );
}
