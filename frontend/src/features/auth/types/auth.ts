import type { DireccionPrincipalRequest } from "@/features/clientes/types/cliente";

export type UserRole = "ADMIN" | "CLIENTE";

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface AuthSession {
  token: string;
  tipo?: string;
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: UserRole;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
  rol: "CLIENTE";
  rut: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  direccionPrincipal: DireccionPrincipalRequest;
}

export type AuthMeResponse = {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
};