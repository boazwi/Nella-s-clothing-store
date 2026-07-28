import type { Session } from "@/types";

/**
 * The single integration seam for authentication (SPEC §4.1).
 * Backed by Supabase Auth (`supabaseAuthService`); `mockAuthService` implements
 * the same interface as a test double. Swapping the binding in `index.ts`
 * changes the backend with no UI changes.
 */
export interface AuthService {
  signUp(fullName: string, email: string, password: string): Promise<Session>;
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  /**
   * Optional: subscribe to session changes (login, logout, token refresh,
   * cross-tab). Returns an unsubscribe function. Backends without a native
   * event stream can omit this.
   */
  subscribe?(onChange: (session: Session | null) => void): () => void;
}
