export interface DetallePedido {
  idDetalle?: number;
  idProducto: number;
  cantidad: number;
  precioUnitarioSnapshot: number;
}

export interface CrearPedidoDetallePayload {
  idProducto: number;
  cantidad: number;
  precioUnitarioSnapshot: number;
}

export interface CrearPedidoPayload {
  idCliente: number;
  estadoPedido: string;
  montoTotal: number;
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