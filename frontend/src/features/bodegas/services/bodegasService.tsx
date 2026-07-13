import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Bodega } from "../types/bodega";

const aplanarDireccion = (d: any): string => {
  if (!d) return "";
  if (typeof d === "string") return d;
  const partes = [
    d.calle, d.numero, d.detalle,
    d.nombreComuna, d.nombreProvincia, d.nombreRegion,
  ].filter(Boolean);
  return partes.join(", ");
};

const normalizar = (b: any): Bodega => ({
  idBodega: b.idBodega,
  nombre: b.nombre ?? "",
  direccionFisica: aplanarDireccion(b.direccion),
  direccion: b.direccion,
});

export const bodegasService = {
  getAll: async (): Promise<Bodega[]> => {
    const data = await apiGet<any[]>(endpoints.bodegas);
    return Array.isArray(data) ? data.map(normalizar) : [];
  },

  getById: async (id: number): Promise<Bodega | null> => {
    const bodegas = await bodegasService.getAll();
    return bodegas.find((item) => item.idBodega === id) ?? null;
  },

  create: (payload: object) =>
    apiPost<any>(endpoints.bodegas, payload).then(normalizar),

  update: (id: number, payload: object) =>
    apiPut<any>(`${endpoints.bodegas}/${id}`, payload).then(normalizar),

  remove: (id: number) =>
    apiDelete(`${endpoints.bodegas}/${id}`),
};