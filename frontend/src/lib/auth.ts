export type AuthSession = {
  token: string;
  tipo: string;
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
};

const AUTH_STORAGE_KEY = "smartlogix.auth";

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function isAuthenticated(): boolean {
  return !!getSession()?.token;
}

export function isAdmin(): boolean {
  return getSession()?.rol === "ADMIN";
}

export function isCliente(): boolean {
  return getSession()?.rol === "CLIENTE";
}

export function canBuy(): boolean {
  return isCliente();
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}