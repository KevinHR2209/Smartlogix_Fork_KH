import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Producto } from "../types/producto";

export const productosService = {
  getAll: () => apiGet<Producto[]>(endpoints.productos),

  getById: async (id: number) => {
    const productos = await apiGet<Producto[]>(endpoints.productos);
    return productos.find((item) => item.idProducto === id) ?? null;
  },

  create: (producto: Omit<Producto, "idProducto">) =>
    apiPost<Producto>(endpoints.productos, producto),

  update: (id: number, producto: Producto) =>
    apiPut<Producto>(`${endpoints.productos}/${id}`, producto),

  remove: (id: number) =>
    apiDelete(`${endpoints.productos}/${id}`),
};