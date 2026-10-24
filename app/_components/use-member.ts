"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type Member = { id: string; firstName: string; lastName: string; username: string; email: string; role: 'member'|'admin'|'superadmin'; phone: string; address: string };

export function useMember() {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setReady(true); return; }
    let active = true;
    let request = 0;
    async function update() {
      const current = ++request;
      try {
        const { data, error: authError } = await supabase!.auth.getUser();
        if (!active || current !== request) return;
        if (!data.user) {
          setMember(null); setError(Boolean(authError && authError.name !== "AuthSessionMissingError"));
          setReady(true); return;
        }
        const { data: profile, error: profileError } = await supabase!.from("profiles")
          .select("id, first_name, last_name, username").eq("id", data.user.id).single();
        if (!active || current !== request) return;
        if (authError || profileError || !profile) throw new Error("profile_unavailable");
        const [roleResult, contactResult] = await Promise.all([
          supabase!.rpc('member_role'),
          supabase!.from('member_contacts').select('phone,address').eq('user_id',data.user.id).maybeSingle(),
        ]);
        if (!active || current !== request) return;
        // Existing memberships keep working before the shop migration is deployed.
        const role = ['admin','superadmin'].includes(roleResult.data) ? roleResult.data : 'member';
        setMember({ id: profile.id, firstName: profile.first_name, lastName: profile.last_name,
          username: profile.username, email: data.user.email || "", role,
          phone: contactResult.data?.phone || '', address: contactResult.data?.address || '' });
        setError(false);
      } catch {
        if (active && current === request) { setMember(null); setError(true); }
      } finally {
        if (active && current === request) setReady(true);
      }
    }
    void update();
    // Do not await other Auth methods from the SDK's auth-state callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setTimeout(() => { if (active) void update(); }, 0); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [revision]);
  return { member, ready, error, retry: () => { setReady(false); setRevision(value => value + 1); } };
}
