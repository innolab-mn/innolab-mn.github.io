import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";

const markerKey = "innolab-password-recovery";
const maxAge = 30 * 60 * 1000;
type RecoveryMarker = { userId: string; sessionId: string; expiresAt: number };
let memoryMarker: RecoveryMarker | null = null;

function sessionIdentity(session: Session) {
  try {
    const payload = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const value = JSON.parse(atob(payload)).session_id;
    return typeof value === "string" ? value : null;
  } catch { return null; }
}

function readMarker(): RecoveryMarker | null {
  try { return JSON.parse(sessionStorage.getItem(markerKey) || "null") || memoryMarker; }
  catch { return memoryMarker; }
}

export function clearRecoverySession() {
  memoryMarker = null;
  try { sessionStorage.removeItem(markerKey); } catch { /* Memory fallback. */ }
}

// Subscribe at client creation so the recovery event cannot be missed by a
// later-mounted page. This marker is UI state, never an authorization boundary.
// The SDK verifies the email link; getUser and updateUser verify with Auth again.
export function trackRecoverySession(event: AuthChangeEvent, session: Session | null) {
  if (event === "PASSWORD_RECOVERY" && session) {
    const sessionId = sessionIdentity(session);
    if (!sessionId) { clearRecoverySession(); return; }
    memoryMarker = { userId: session.user.id, sessionId, expiresAt: Date.now() + maxAge };
    try { sessionStorage.setItem(markerKey, JSON.stringify(memoryMarker)); } catch { /* Memory fallback. */ }
  } else if (event === "SIGNED_OUT") {
    clearRecoverySession();
  } else if (event === "SIGNED_IN") {
    // The SDK also emits SIGNED_IN when the same session is restored on reload
    // or tab focus. Preserve that recovery; a different login clears it.
    const marker = readMarker();
    if (!session || marker?.userId !== session.user.id || marker.sessionId !== sessionIdentity(session)) clearRecoverySession();
  }
}

export async function canResetPassword(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) return false;
  const marker = readMarker();
  if (!marker || marker.userId !== data.session.user.id || marker.sessionId !== sessionIdentity(data.session) ||
      !Number.isFinite(marker.expiresAt) || marker.expiresAt <= Date.now() ||
      marker.expiresAt > Date.now() + maxAge) return false;
  const { data: verified, error: verificationError } = await client.auth.getUser();
  return !verificationError && verified.user?.id === marker.userId;
}

export async function updateRecoveredPassword(client: SupabaseClient, password: string) {
  if (!await canResetPassword(client)) throw new Error("recovery_expired");
  const { error } = await client.auth.updateUser({ password });
  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") throw new Error(error.code);
    if (error.status === 429) throw new Error("rate_limited");
    throw new Error("unavailable");
  }
  clearRecoverySession();
  // A password update has already succeeded; do not report it as failed if a
  // subsequent logout request fails. Prefer revoking refresh sessions globally.
  try {
    const { error: signOutError } = await client.auth.signOut({ scope: "global" });
    if (signOutError) await client.auth.signOut({ scope: "local" });
  } catch { /* Password was updated. The user can continue to sign in. */ }
}
