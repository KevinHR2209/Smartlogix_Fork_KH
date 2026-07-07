import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Transportista } from "@/types";

export const transportistasService = {
  getAll: () => apiGet<Transportista[]>(endpoints.transportistas),

  create: (data: Transportista) =>
    apiPost<Transportista>(endpoints.transportistas, data),

  update: (id: number, data: Transportista) =>
    apiPut<Transportista>(`${endpoints.transportistas}/${id}`, data),

  remove: (id: number) =>
    apiDelete(`${endpoints.transportistas}/${id}`),
};