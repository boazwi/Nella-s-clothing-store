import { mockAuthService } from "./mockAuthService";
import type { AuthService } from "./types";

// Swap this single binding to change the auth backend for the whole app.
export const authService: AuthService = mockAuthService;

export type { AuthService } from "./types";
