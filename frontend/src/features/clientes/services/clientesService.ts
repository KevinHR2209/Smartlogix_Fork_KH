import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Cliente } from "@/types";

type ClientePayload = Omit<Cliente, "idCliente">;

export const clientesService = {
  getAll: () => apiGet<Cliente[]>(endpoints.clientes),

  getById: (id: number) =>
    apiGet<Cliente>(`${endpoints.clientes}/${id}`),

  // Usado en el checkout: el JWT solo trae el correo del usuario logueado,
  // hay que resolver su idCliente antes de poder crear un pedido.
  getByCorreo: (correo: string) =>
    apiGet<Cliente>(`${endpoints.clientes}/correo/${encodeURIComponent(correo)}`),

  create: (cliente: ClientePayload) =>
    apiPost<Cliente>(endpoints.clientes, cliente),

  update: (id: number, cliente: ClientePayload) =>
    apiPut<Cliente>(`${endpoints.clientes}/${id}`, cliente),

  remove: (id: number) =>
    apiDelete<void>(`${endpoints.clientes}/${id}`),
};