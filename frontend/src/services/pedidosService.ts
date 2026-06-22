import { apiGet, apiPost, apiPutParams } from './api';
import { Pedido } from '@/types';

export interface CrearPedidoPayload {
  idCliente: number;
  estadoPedido: string;
  montoTotal: number;
  detalles: {
    idProducto: number;
    cantidad: number;
    precioUnitarioSnapshot: number;
  }[];
}

export const pedidosService = {
  getAll: () => apiGet<Pedido[]>('/api/pedidos'),
  create: (payload: CrearPedidoPayload, regionDestino: string) =>
    apiPost<Pedido>(
      `/api/pedidos?regionDestino=${encodeURIComponent(regionDestino)}`,
      payload
    ),
  cambiarEstado: (id: number, estado: string) =>
    apiPutParams(`/api/pedidos/${id}/estado?estado=${estado}`),
};
