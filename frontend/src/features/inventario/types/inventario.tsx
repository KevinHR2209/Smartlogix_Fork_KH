export type Inventario = {
  idInventario?: number;
  idBodega: number;
  nombreBodega?: string;
  idProducto: number;
  sku?: string;
  nombreProducto?: string;
  stockDisponible: number;
  stockReservado: number;
};

export type InventarioRequest = {
  idBodega: number;
  idProducto: number;
  stockDisponible: number;
  stockReservado: number;
};

export type CantidadRequest = {
  cantidad: number;
};

export type TransferenciaStockRequest = {
  idProducto: number;
  idBodegaOrigen: number;
  idBodegaDestino: number;
  cantidad: number;
};