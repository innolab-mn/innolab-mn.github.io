import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { trackRecoverySession } from "./password-recovery";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Enable after the migration and username-login function are configured.
// Public registration additionally needs a production email sender.
export const membershipConfigured = Boolean(url && key && process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED === "true");
let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!membershipConfigured || !url || !key) return null;
  // Only the public project key belongs in the static website.
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    client.auth.onAuthStateChange(trackRecoverySession);
  }
  return client;
}

export async function requestPasswordReset(email: string, locale: "mn" | "en", captchaToken?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("not_configured");
  const path = locale === "en" ? "/en/reset-password" : "/reset-password";
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL(path, window.location.origin).href,
    ...(captchaToken ? { captchaToken } : {}),
  });
  if (error) throw new Error(error.code === "captcha_failed" ? "captcha_failed" : error.status === 429 ? "rate_limited" : "unavailable");
}

export async function loginWithUsername(username: string, password: string, captchaToken?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("not_configured");
  const response = await fetch(`${url}/functions/v1/username-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key! },
    body: JSON.stringify({ username: username.trim().normalize("NFC").toLowerCase(), password, ...(captchaToken ? { captchaToken } : {}) }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (body?.error === "captcha_failed") throw new Error("captcha_failed");
    throw new Error(response.status === 429 ? "rate_limited" : response.status >= 500 || response.status === 404 ? "unavailable" : "invalid_login");
  }
  const session = await response.json();
  if (!session.access_token || !session.refresh_token) throw new Error("unavailable");
  const { error } = await supabase.auth.setSession(session);
  if (error) throw new Error("unavailable");
}
