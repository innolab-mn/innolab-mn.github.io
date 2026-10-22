"use client";
import { useState } from "react";
import { localeHref, type Locale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member-copy";
import { getSupabase, membershipConfigured } from "@/lib/supabase";
import { useMember } from "./use-member";
import { ArrowUpRight } from "./ui";

export default function MemberDashboard({ locale }: { locale: Locale }) {
  const copy = memberCopy(locale);
  const { member: profile, ready, error, retry } = useMember();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const { error } = await getSupabase()!.auth.signOut({ scope: "local" });
      if (error) throw error;
      window.location.assign(localeHref("/login", locale));
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }
  if (!ready)
    return (
      <section className="container loading-state" role="status">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.loading}</h1>
      </section>
    );
  if (error)
    return (
      <section className="container member-gate">
        <h1>{copy.profileError}</h1>
        <div className="actions">
          <button className="button" onClick={retry}>{copy.retry}</button>
          <button className="button button-outline" onClick={signOut} disabled={signingOut}>
            {copy.signOut}
          </button>
        </div>
        {signOutError && <p role="alert">{copy.signOutError}</p>}
      </section>
    );
  if (!profile)
    return (
      <section className="container member-gate">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.gateTitle}</h1>
        <p>{copy.gateIntro}</p>
        {!membershipConfigured && <p className="auth-status-note">{copy.setupPending}</p>}
        <div className="actions">
          <a className="button" href={localeHref("/login", locale)}>
            {copy.signIn}
            <ArrowUpRight />
          </a>
          <a
            className="button button-outline"
            href={localeHref("/register", locale)}
          >
            {copy.register}
            <ArrowUpRight />
          </a>
        </div>
      </section>
    );
  const name = profile.firstName || profile.username;
  return (
    <section className="container member-dashboard">
      <header className="member-welcome">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <p className="member-greeting">
            {copy.hello}, {name}.
          </p>
          <h1>{copy.welcome}</h1>
          <p>{copy.welcomeText}</p>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={signOut}
          disabled={signingOut}
        >
          {copy.signOut}
          <ArrowUpRight />
        </button>
      </header>
      {signOutError && <p className="auth-error-summary" role="alert">{copy.signOutError}</p>}
      <div className="member-content">
        <div className="member-main">
          <h2>{copy.nextSteps}</h2>
          <div className="member-next-grid">
            {[
              {
                href: "/courses",
                title: copy.courseTitle,
                text: copy.courseText,
                action: copy.courseAction,
                number: "01",
                image: "/assets/blender-logo.png",
              },
              {
                href: "/activities",
                title: copy.activityTitle,
                text: copy.activityText,
                action: copy.activityAction,
                number: "02",
              },
              {
                href: "/projects",
                title: copy.projectTitle,
                text: copy.projectText,
                action: copy.projectAction,
                number: "03",
              },
              {
                href: "/products",
                title: copy.shopTitle,
                text: copy.shopText,
                action: copy.shopAction,
                number: "04",
              },
            ].map((item) => (
              <a
                className={`member-next-card${item.number === "01" ? " member-featured" : ""}`}
                href={localeHref(item.href, locale)}
                key={item.href}
              >
                <div className="member-card-top">
                  <small>{item.number} /</small>
                  {item.image && (
                    <img src={item.image} alt="" width="42" height="42" />
                  )}
                  <ArrowUpRight />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span>
                  {item.action}
                  <span aria-hidden="true"> →</span>
                </span>
              </a>
            ))}
          </div>
          <div className="member-support">
            <h2>{copy.needDirection}</h2>
            <p>{copy.directionText}</p>
            <a className="text-link" href={localeHref("/contact", locale)}>
              {copy.contact}
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <aside className="member-profile">
          <div className="member-avatar" aria-hidden="true">
            {Array.from(name)[0]?.toLocaleUpperCase(locale) || "M"}
          </div>
          <span className="member-badge">{copy.memberBadge}</span>
          <h2>{copy.profile}</h2>
          <dl className="facts">
            {[
              [copy.firstName, profile.firstName],
              [copy.lastName, profile.lastName],
              [copy.username, profile.username],
              [copy.email, profile.email],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || copy.notProvided}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
