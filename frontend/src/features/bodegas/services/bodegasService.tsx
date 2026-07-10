import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Bodega } from "../types/bodega";

export const bodegasService = {
  getAll: () => apiGet<Bodega[]>(endpoints.bodegas),

  getById: async (id: number) => {
    const bodegas = await apiGet<Bodega[]>(endpoints.bodegas);
    return bodegas.find((item) => item.idBodega === id) ?? null;
  },

  create: (bodega: Omit<Bodega, "idBodega">) =>
    apiPost<Bodega>(endpoints.bodegas, bodega),

  update: (id: number, bodega: Bodega) =>
    apiPut<Bodega>(`${endpoints.bodegas}/${id}`, bodega),

  remove: (id: number) =>
    apiDelete(`${endpoints.bodegas}/${id}`),
};