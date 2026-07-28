import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Session, User, UserRole } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuthService } from "./types";

// Placeholder role rule (kept from the mock): emails ending in @admin.nella are
// admins, so the admin area stays reachable without any DB/role setup. Real role
// management (Supabase app_metadata + RLS) is future scope.
function roleForEmail(email: string): UserRole {
  return email.toLowerCase().endsWith("@admin.nella") ? "admin" : "shopper";
}

function mapUser(user: SupabaseUser): User {
  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || "";
  return { id: user.id, email, fullName, role: roleForEmail(email) };
}

export const supabaseAuthService: AuthService = {
  async signUp(fullName, email, password) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign up did not return a user.");
    return { user: mapUser(data.user), token: data.session?.access_token };
  },

  async login(email, password) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: mapUser(data.user), token: data.session?.access_token };
  },

  async logout() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return {
      user: mapUser(data.session.user),
      token: data.session.access_token,
    };
  },

  subscribe(onChange) {
    const supabase = getSupabaseClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      onChange(
        session
          ? { user: mapUser(session.user), token: session.access_token }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  },
};
