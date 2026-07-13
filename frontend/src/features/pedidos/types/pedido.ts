export interface DetallePedido {
  idDetalle?: number;
  idPresentacion: number;
  cantidad: number;
  precioUnitarioSnapshot?: number;
}

export interface CrearPedidoDetallePayload {
  idPresentacion: number;
  cantidad: number;
}

export interface CrearPedidoPayload {
  idCliente: number;
  detalles: CrearPedidoDetallePayload[];
}

export interface Pedido {
  idPedido?: number;
  idCliente: number;
  fechaCreacion?: string;
  montoTotal: number;
  estadoPedido: string;
  detalles?: DetallePedido[];
}