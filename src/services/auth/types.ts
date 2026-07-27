import type { Session } from "@/types";

/**
 * The single integration seam for authentication (SPEC §4.1).
 * This release ships a localStorage mock; a real provider (Supabase/Clerk/…)
 * can implement this same interface later with no UI changes.
 */
export interface AuthService {
  signUp(email: string, password: string): Promise<Session>;
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}
