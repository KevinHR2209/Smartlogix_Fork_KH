import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession } from "@/lib/auth";
import type { LoginPayload, RegisterRequest, AuthMeResponse } from "../types/auth";

export const authService = {
  login: (payload: LoginPayload) =>
    apiPost<AuthSession>(endpoints.auth.login, payload),

  register: (payload: RegisterRequest) =>
    apiPost<AuthSession>(endpoints.auth.register, {
      ...payload,
      rol: "CLIENTE",
    }),

me: () => apiGet<AuthMeResponse>(endpoints.auth.me),
};

export type { LoginPayload };