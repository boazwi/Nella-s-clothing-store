import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client for server-only privileged operations (writing
// to `subscriptions`/`payments`, reading/updating a user's app_metadata).
// The service role key bypasses RLS entirely — this must NEVER be imported
// from a "use client" file or otherwise reach the browser.

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
