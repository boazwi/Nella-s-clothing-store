import { getSupabaseAdminClient } from "./serverAdmin";

/**
 * Best-effort attempt to invalidate a user's existing sessions when their
 * subscription lapses. This is a UX accelerant only, NOT the security
 * boundary — supabase-js has no first-class "revoke all sessions for this
 * user id" call, so this relies on deleting their auth.sessions rows
 * directly. If it fails (unavailable, permissions, schema changes), silently
 * swallow the error: entitlement is still enforced on every try-on request
 * via a live `subscriptions` lookup (see app/api/try-on/route.ts), so a
 * still-valid access token cannot be used to generate images regardless of
 * whether this call succeeds.
 */
export async function revokeSessions(userId: string): Promise<void> {
  try {
    const admin = getSupabaseAdminClient();
    await admin.schema("auth").from("sessions").delete().eq("user_id", userId);
  } catch {
    // Best-effort only — see doc comment above.
  }
}
