import type { Session, User } from "@/types";
import type { AuthService } from "./types";

const STORAGE_KEY = "nella.session";

// Placeholder rule: emails ending in @admin.nella are treated as admins so the
// admin area is reachable in development. Real role assignment comes with the
// real auth provider.
function roleForEmail(email: string): User["role"] {
  return email.toLowerCase().endsWith("@admin.nella") ? "admin" : "shopper";
}

function makeSession(email: string): Session {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    role: roleForEmail(email),
  };
  return { user };
}

function persist(session: Session): Session {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

/**
 * Development-only mock. Accepts any credentials, stores the session in
 * localStorage. NOT for production use.
 */
export const mockAuthService: AuthService = {
  async signUp(email) {
    return persist(makeSession(email));
  },
  async login(email) {
    return persist(makeSession(email));
  },
  async logout() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  },
  async getSession() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  },
};
