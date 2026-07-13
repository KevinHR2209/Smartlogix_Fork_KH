// frontend/src/features/clientes/services/clientesService.ts
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Cliente, CrearClienteRequest } from "@/features/clientes/types/cliente";

export const clientesService = {
  getAll: () => apiGet<Cliente[]>(endpoints.clientes),

  getById: (id: number) =>
    apiGet<Cliente>(`${endpoints.clientes}/${id}`),

  getByCorreo: (correo: string) =>
    apiGet<Cliente>(`${endpoints.clientes}/correo/${encodeURIComponent(correo)}`),

  // ← SOLO para crear desde admin — el backend espera /desde-auth
  crearDesdeAuth: (payload: CrearClienteRequest) =>
    apiPost<Cliente>(`${endpoints.clientes}/desde-auth`, payload),

  // ← Actualizar — backend acepta mismo DTO que crearDesdeAuth
  update: (id: number, payload: CrearClienteRequest) =>
    apiPut<Cliente>(`${endpoints.clientes}/${id}`, payload),

  remove: (id: number) =>
    apiDelete<void>(`${endpoints.clientes}/${id}`),
};