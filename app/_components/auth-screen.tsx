"use client";
import { useEffect, useRef, useState } from "react";
import { localeHref, type Locale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member-copy";
import { getSupabase, loginWithUsername, membershipConfigured, requestPasswordReset } from "@/lib/supabase";
import AuthField, { type AuthFieldName } from "./auth-field";
import AuthSuccess from "./auth-success";
import { ArrowUpRight } from "./ui";
import Turnstile from "./turnstile";
import { turnstileSiteKey } from "@/lib/turnstile";

type Field = AuthFieldName;
type Values = Record<Field, string>;
const empty: Values = { firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "" };
const usernamePattern = new RegExp(
  "^[\\p{L}\\p{N}][\\p{L}\\p{N}_.-]{2,23}$",
  "u",
);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function AuthScreen({
  mode,
  locale,
}: {
  mode: "login" | "register" | "forgot";
  locale: Locale;
}) {
  const copy = memberCopy(locale);
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => setHydrated(true), []);
  function change(name: Field, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !membershipConfigured) return;
    const next: Partial<Record<Field, string>> = {};
    const fields: Field[] = isForgot ? ["email"] : isRegister
      ? ["firstName", "lastName", "username", "email", "password"]
      : ["username", "password"];
    for (const name of fields) {
      const value = values[name].trim();
      if (!value) next[name] = copy.required;
      else if (
        (name === "firstName" || name === "lastName") &&
        value.length > 50
      )
        next[name] = copy.nameError;
      else if (name === "username" && !usernamePattern.test(value))
        next[name] = copy.usernameError;
      else if (name === "email" && !emailPattern.test(value))
        next[name] = copy.emailError;
      else if (
        name === "password" &&
        (values.password.length < 8 || values.password.length > 128)
      )
        next[name] = copy.passwordError;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      const first = fields.find((name) => next[name]);
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLInputElement>(`#auth-${first}`)
          ?.focus(),
      );
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      setServerError(copy.captchaRequired);
      form.current?.querySelector<HTMLElement>("#auth-captcha")?.focus();
      return;
    }
    setBusy(true);
    setServerError("");
    setSuccess(false);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("not_configured");
      if (isForgot) {
        await requestPasswordReset(values.email.trim(), locale, captchaToken || undefined);
        setSuccess(true);
      } else if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: values.email.trim(),
          password: values.password,
          options: {
            ...(captchaToken ? { captchaToken } : {}),
            emailRedirectTo: new URL(localeHref("/members", locale), window.location.origin).href,
            data: {
              first_name: values.firstName.trim(), last_name: values.lastName.trim(), locale,
              username: values.username.trim().normalize("NFC").toLowerCase(),
            },
          },
        });
        if (error) {
          const code = error.code || "";
          if (code === "captcha_failed") throw new Error("captcha_failed");
          if (code.includes("rate_limit")) throw new Error("rate_limited");
          if (code === "email_address_not_authorized" || code === "email_address_not_authorized_to_send_to") throw new Error("email_unavailable");
          if (code === "weak_password") throw new Error("weak_password");
          // Duplicate usernames are rejected atomically by the signup trigger.
          if (code === "unexpected_failure" || code === "user_already_exists") throw new Error("signup_failed");
          throw new Error("unavailable");
        }
        if (data.session) window.location.assign(localeHref("/members", locale));
        else setSuccess(true);
      } else {
        await loginWithUsername(values.username, values.password, captchaToken || undefined);
        window.location.assign(localeHref("/members", locale));
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : "unavailable";
      setServerError(code === "captcha_failed" ? copy.captchaRequired : code === "invalid_login" ? copy.invalidLogin : code === "rate_limited" ? copy.rateLimited :
        code === "signup_failed" ? copy.signupFailed : code === "weak_password" ? copy.passwordError :
        code === "email_unavailable" ? copy.emailUnavailable : copy.unavailable);
    } finally {
      setValues(current => ({ ...current, password: "" }));
      setShowPassword(false);
      setBusy(false);
      // Verification tokens are single-use; every request needs a fresh token.
      setCaptchaToken("");
      setCaptchaReset(current => current + 1);
    }
  }
  const field = (name: Field) => (
    <AuthField
      key={name}
      name={name}
      value={values[name]}
      error={errors[name]}
      copy={copy}
      onChange={change}
      showPassword={showPassword}
      onToggle={() => setShowPassword((current) => !current)}
      newPassword={isRegister}
    />
  );
  return (
    <section className="container auth-layout">
      <aside className="auth-story">
        <p className="eyebrow">
          {locale === "en" ? "INNOLAB / COMMUNITY" : "INNOLAB / ХАМТ ОЛОН"}
        </p>
        <h2>{copy.storyTitle}</h2>
        <p>{copy.storyText}</p>
        <div className="auth-story-steps">
          {[
            [copy.storyLearn, copy.storyLearnText],
            [copy.storyBuild, copy.storyBuildText],
            [copy.storyTogether, copy.storyTogetherText],
          ].map(([title, text], index) => (
            <div key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <a href={localeHref("/courses", locale)} className="text-link">
          {copy.courseAction}
          <ArrowUpRight />
        </a>
        <div className="auth-story-mark" aria-hidden="true">
          {locale === "en" ? (
            <>
              LEARN.
              <br />
              BUILD.
              <br />
              BELONG.
            </>
          ) : (
            <>
              СУРАЛЦ.
              <br />
              БҮТЭЭ.
              <br />
              НЭГД.
            </>
          )}
        </div>
      </aside>
      <div className="auth-panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{isForgot ? copy.forgotTitle : isRegister ? copy.registerTitle : copy.loginTitle}</h1>
        <p className="auth-intro">
          {isForgot ? copy.forgotIntro : isRegister ? copy.registerIntro : copy.loginIntro}
        </p>
        {!membershipConfigured && <div className="auth-status-note" role="status"><p>{copy.setupPending}</p></div>}
        {success && <AuthSuccess locale={locale} kind={isForgot ? "recovery-email" : "registration"} email={values.email.trim()} onEdit={() => { setSuccess(false); setServerError(""); requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>("#auth-email")?.focus()); }} /> }
        {serverError && <p className="auth-error-summary" role="alert">{serverError}</p>}
        {!success && <form
          ref={form}
          onSubmit={submit}
          noValidate
          method="post"
          aria-busy={busy}
        >
          {Object.values(errors).some(Boolean) && (
            <p className="auth-error-summary" role="alert">
              {copy.errorTitle}
            </p>
          )}
          <fieldset className="auth-fields" disabled={!hydrated || busy || !membershipConfigured}>
            <legend className="sr-only">
              {isForgot ? copy.sendReset : isRegister ? copy.register : copy.signIn}
            </legend>
            {isForgot ? field("email") : isRegister ? (
              <>
                <div className="auth-name-row">
                  {field("firstName")}
                  {field("lastName")}
                </div>
                {field("username")}
                {field("email")}
              </>
            ) : (
              field("username")
            )}
            {!isForgot && field("password")}
            {mode === "login" && <a className="auth-forgot" href={localeHref("/forgot-password", locale)}>{copy.forgotPassword}</a>}
            {membershipConfigured && turnstileSiteKey && <Turnstile locale={locale} action={mode} reset={captchaReset} onToken={setCaptchaToken} />}
            <button
              className="button auth-submit"
              type="submit"
              disabled={!hydrated || busy || !membershipConfigured || Boolean(turnstileSiteKey && !captchaToken)}
            >
              {busy
                ? copy.busy
                : isForgot ? copy.sendReset : isRegister
                  ? copy.registerSubmit
                  : copy.loginSubmit}
              <ArrowUpRight />
            </button>
          </fieldset>
        </form>}
        {mode === "login" && (
          <details className="auth-help">
            <summary>{copy.help}</summary>
            <p>{copy.helpText}</p>
          </details>
        )}
        <p className="auth-switch">
          {isForgot ? copy.rememberPassword : isRegister ? copy.alreadyMember : copy.newHere}{" "}
          <a href={localeHref(isForgot || isRegister ? "/login" : "/register", locale)}>
            {isForgot || isRegister ? copy.signIn : copy.register}
            <span aria-hidden="true"> ↗</span>
          </a>
        </p>
        <noscript>
          <p className="auth-error-summary">
            {locale === "en"
              ? "Enable JavaScript to sign in or create an account."
              : "Нэвтрэх эсвэл бүртгүүлэхийн тулд JavaScript-ийг идэвхжүүлнэ үү."}
          </p>
        </noscript>
      </div>
    </section>
  );
}
