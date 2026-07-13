export interface Inventario {
  idInventario: number;
  idBodega: number;
  nombreBodega: string;
  idPresentacion: number;
  idPerfume: number;
  nombrePerfume: string;
  volumenMl: number;
  tipoEnvase: string;
  precioActual: number;
  stockDisponible: number;
  stockReservado: number;
  stockMinimo: number;
  stockBajo: boolean;
  ultimaActualizacion: string;
}

export interface InventarioRequest {
  idBodega: number;
  idPresentacion: number;
  stockDisponible: number;
  stockReservado: number;
  stockMinimo: number;
}

export interface TransferenciaStockRequest {
  idPresentacion: number;
  idBodegaOrigen: number;
  idBodegaDestino: number;
  cantidad: number;
  observacion?: string;
  usuarioResponsable?: string;
}

export interface CantidadRequest {
  cantidad: number;
}

export interface MovimientoResponse {
  idMovimiento: number;
  tipoMovimiento: string;
  idPresentacion: number;
  nombrePerfume: string;
  volumenMl: number;
  idBodegaOrigen?: number;
  nombreBodegaOrigen?: string;
  idBodegaDestino?: number;
  nombreBodegaDestino?: string;
  cantidad: number;
  idPedido?: number;
  observacion?: string;
  fechaMovimiento: string;
  usuarioResponsable?: string;
}