import { apiGet, apiPost, apiPutParams } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Pedido, CrearPedidoPayload } from "@/types";

export const pedidosService = {
  getAll: () => apiGet<Pedido[]>(endpoints.pedidos),

  // Backend: PedidoController.listarPorCliente -> GET /api/pedidos/cliente/{idCliente}
  getByCliente: (idCliente: number) => apiGet<Pedido[]>(`${endpoints.pedidos}/cliente/${idCliente}`),

  // El backend (PedidoController.crear) ya no recibe regionDestino como
  // query param, ni espera montoTotal/estadoPedido/precioUnitarioSnapshot
  // en el body: calcula el precio real contra ms-inventario y arma el
  // pedido en estado PENDIENTE_PAGO el mismo.
  create: (payload: CrearPedidoPayload) => apiPost<Pedido>(endpoints.pedidos, payload),

  cambiarEstado: (id: number, estado: string) =>
    apiPutParams(`${endpoints.pedidos}/${id}/estado?estado=${encodeURIComponent(estado)}`),
};