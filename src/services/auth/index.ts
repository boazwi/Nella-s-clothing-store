import { supabaseAuthService } from "./supabaseAuthService";
import type { AuthService } from "./types";

// Swap this single binding to change the auth backend for the whole app.
// `mockAuthService` remains available as a test double.
export const authService: AuthService = supabaseAuthService;

export type { AuthService } from "./types";
