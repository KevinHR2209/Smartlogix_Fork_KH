// frontend/src/features/auth/use-cases/registerClient.ts
import { authService } from "../services/authService";
import type { RegisterRequest } from "../types/auth";
import type { AuthSession } from "@/lib/auth";

export async function registerClient(input: RegisterRequest): Promise<AuthSession> {
  return authService.register(input) as Promise<AuthSession>;
}