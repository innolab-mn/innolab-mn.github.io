"use client";
import { memberCopy } from "@/lib/member-copy";
export type AuthFieldName = "firstName" | "lastName" | "username" | "email" | "password" | "confirmPassword";
type Copy = ReturnType<typeof memberCopy>;
export default function AuthField({
  name,
  value,
  error,
  copy,
  onChange,
  showPassword,
  onToggle,
  newPassword,
}: {
  name: AuthFieldName;
  value: string;
  error?: string;
  copy: Copy;
  onChange: (name: AuthFieldName, value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
  newPassword: boolean;
}) {
  const isPassword = name === "password" || name === "confirmPassword";
  const hint = name === "confirmPassword" ? "" : isPassword
    ? copy.passwordHint
    : name === "username"
      ? copy.usernameHint
      : "";
  const placeholders: Record<AuthFieldName, string> = {
    firstName: copy.firstPlaceholder,
    lastName: copy.lastPlaceholder,
    username: copy.usernamePlaceholder,
    email: copy.emailPlaceholder,
    password: copy.passwordPlaceholder,
    confirmPassword: copy.passwordPlaceholder,
  };
  const autocomplete: Record<AuthFieldName, string> = {
    firstName: "given-name",
    lastName: "family-name",
    username: "username",
    email: "email",
    password: newPassword ? "new-password" : "current-password",
    confirmPassword: "new-password",
  };
  return (
    <div className={`auth-field${error ? " has-error" : ""}`}>
      <label htmlFor={`auth-${name}`}>
        {copy[name]} <span aria-hidden="true">*</span>
      </label>
      <div className="auth-input-wrap">
        <input
          id={`auth-${name}`}
          name={name}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : name === "email"
                ? "email"
                : "text"
          }
          inputMode={name === "email" ? "email" : undefined}
          value={value}
          placeholder={placeholders[name]}
          autoComplete={autocomplete[name]}
          autoCapitalize={
            name === "username" || name === "email"
              ? "none"
              : undefined
          }
          spellCheck={name === "firstName" || name === "lastName"}
          maxLength={
            isPassword
              ? 128
              : name === "email"
                ? 254
                : name === "username"
                  ? 24
                  : 50
          }
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `auth-${name}-hint` : "", error ? `auth-${name}-error` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) => onChange(name, event.target.value)}
          className={isPassword ? "password-input" : undefined}
        />
        {isPassword && (
          <button
            className="password-toggle"
            type="button"
            onClick={onToggle}
            aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            aria-pressed={showPassword}
            title={showPassword ? copy.hidePassword : copy.showPassword}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
      {hint && (
        <p className="auth-field-hint" id={`auth-${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="auth-field-error" id={`auth-${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

