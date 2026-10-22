"use client";
import { useEffect, useRef, useState } from "react";
import { localeHref, type Locale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member-copy";
import { getSupabase } from "@/lib/supabase";
import { canResetPassword, updateRecoveredPassword } from "@/lib/password-recovery";
import AuthField from "./auth-field";
import AuthSuccess from "./auth-success";
import { ArrowUpRight } from "./ui";

export default function ResetPassword({ locale }: { locale: Locale }) {
  const copy = memberCopy(locale);
  const [state, setState] = useState<"loading" | "ready" | "invalid" | "success">("loading");
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<typeof values>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const completed = useRef(false);
  useEffect(() => {
    let active = true;
    const supabase = getSupabase();
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const invalidLink = fragment.has("error") || fragment.has("error_code") || new URLSearchParams(window.location.search).has("error");
    if (!supabase || invalidLink) { setState("invalid"); return; }
    let revision = 0;
    const check = () => {
      const current = ++revision;
      if (!active || submitting.current || completed.current) return;
      void canResetPassword(supabase).then(allowed => {
        if (active && current === revision && !submitting.current && !completed.current) setState(allowed ? "ready" : "invalid");
      }).catch(() => { if (active && current === revision && !submitting.current && !completed.current) setState("invalid"); });
    };
    // URL initialization can emit PASSWORD_RECOVERY after getSession resolves.
    // Defer Auth calls out of the SDK callback to avoid its internal lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setTimeout(check, 0); });
    check();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || state !== "ready") return;
    const next: Partial<typeof values> = {};
    if (!values.password.trim() || values.password.length < 8 || values.password.length > 128) next.password = copy.passwordError;
    if (!values.confirmPassword) next.confirmPassword = copy.required;
    else if (values.confirmPassword !== values.password) next.confirmPassword = copy.passwordMismatch;
    setErrors(next);
    if (Object.keys(next).length) {
      form.current?.querySelector<HTMLInputElement>(next.password ? "#auth-password" : "#auth-confirmPassword")?.focus();
      return;
    }
    setBusy(true);
    submitting.current = true;
    setServerError("");
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("recovery_expired");
      await updateRecoveredPassword(supabase, values.password);
      completed.current = true;
      setState("success");
    } catch (error) {
      const code = error instanceof Error ? error.message : "unavailable";
      if (code === "recovery_expired") setState("invalid");
      else setServerError(code === "weak_password" ? copy.passwordError : code === "same_password" ? copy.samePassword : code === "rate_limited" ? copy.rateLimited : copy.resetFailed);
    } finally {
      setValues({ password: "", confirmPassword: "" });
      setShowPassword(false);
      setBusy(false);
      submitting.current = false;
    }
  }

  return <section className="container auth-reset-layout">
    <p className="eyebrow">{copy.eyebrow}</p>
    <h1>{copy.resetTitle}</h1>
    {state === "loading" && <p role="status" className="auth-intro">{copy.verifyingReset}</p>}
    {state === "invalid" && <div className="auth-status-note" role="status">
      <h2>{copy.resetInvalidTitle}</h2><p>{copy.resetInvalidText}</p>
      <a className="button" href={localeHref("/forgot-password", locale)}>{copy.requestNewLink}<ArrowUpRight /></a>
    </div>}
    {state === "success" && <AuthSuccess locale={locale} kind="password-updated" />}
    {state === "ready" && <>
      <p className="auth-intro">{copy.resetIntro}</p>
      {serverError && <p className="auth-error-summary" role="alert">{serverError}</p>}
      <form ref={form} onSubmit={submit} method="post" noValidate aria-busy={busy}>
        <fieldset className="auth-fields" disabled={busy}>
          <legend className="sr-only">{copy.updatePassword}</legend>
          {(["password", "confirmPassword"] as const).map(name => <AuthField key={name} name={name} value={values[name]} error={errors[name]} copy={copy} newPassword showPassword={showPassword}
            onToggle={() => setShowPassword(current => !current)} onChange={(field, value) => {
              if (field === "password" || field === "confirmPassword") {
                setValues(current => ({ ...current, [field]: value }));
                setErrors(current => ({ ...current, [field]: undefined }));
              }
            }} />)}
          <button className="button auth-submit" disabled={busy}>{busy ? copy.busy : copy.updatePassword}<ArrowUpRight /></button>
        </fieldset>
      </form>
    </>}
    {state !== "success" && <p className="auth-switch"><a href={localeHref("/login", locale)}>{copy.backToSignIn}</a></p>}
    <noscript><p className="auth-error-summary">{copy.resetNeedsJs}</p></noscript>
  </section>;
}
