import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Cliente } from "@/types";

type ClientePayload = Omit<Cliente, "idCliente">;

export const clientesService = {
  getAll: () => apiGet<Cliente[]>(endpoints.clientes),

  getById: (id: number) =>
    apiGet<Cliente>(`${endpoints.clientes}/${id}`),

  create: (cliente: ClientePayload) =>
    apiPost<Cliente>(endpoints.clientes, cliente),

  update: (id: number, cliente: ClientePayload) =>
    apiPut<Cliente>(`${endpoints.clientes}/${id}`, cliente),

  remove: (id: number) =>
    apiDelete<void>(`${endpoints.clientes}/${id}`),
};