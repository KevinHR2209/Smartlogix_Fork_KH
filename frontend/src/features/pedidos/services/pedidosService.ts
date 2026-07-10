import { apiGet, apiPost, apiPutParams } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Pedido, CrearPedidoPayload } from "@/types";

export const pedidosService = {
  getAll: () => apiGet<Pedido[]>(endpoints.pedidos),

  create: (payload: CrearPedidoPayload, regionDestino: string) =>
    apiPost<Pedido>(
      `${endpoints.pedidos}?regionDestino=${encodeURIComponent(regionDestino)}`,
      payload
    ),

  cambiarEstado: (id: number, estado: string) =>
    apiPutParams(`${endpoints.pedidos}/${id}/estado?estado=${encodeURIComponent(estado)}`),
};