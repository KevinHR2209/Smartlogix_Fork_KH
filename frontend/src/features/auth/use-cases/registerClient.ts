import { authService } from "../services/authService";
import type { RegisterRequest } from "../types/auth";

export async function registerClient(input: RegisterRequest) {
  return authService.register(input);
}