import { apiGet, apiPost, apiPut, apiPutParams } from "@/lib/api/client";
import {
  Inventario,
  InventarioRequest,
  TransferenciaStockRequest,
  CantidadRequest,
  MovimientoResponse,
} from "../types/inventario";

const BASE = "/api/inventario";

export const inventarioService = {
  getById: (idInventario: number) =>
    apiGet<Inventario>(`${BASE}/${idInventario}`),

  getByProducto: (idPresentacion: number) =>
    apiGet<Inventario[]>(`${BASE}/presentacion/${idPresentacion}`),

  getByBodega: (idBodega: number) =>
    apiGet<Inventario[]>(`${BASE}/bodega/${idBodega}`),

  create: (payload: InventarioRequest) =>
    apiPost<Inventario>(BASE, payload),

  ajustar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${BASE}/${idInventario}/ajustar`, payload),

  reservar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${BASE}/${idInventario}/reservar`, payload),

  liberar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${BASE}/${idInventario}/liberar`, payload),

  descontar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${BASE}/${idInventario}/descontar`, payload),

  transferir: (payload: TransferenciaStockRequest) =>
    apiPutParams(`${BASE}/transferir`),

  getMovimientos: (idPresentacion: number) =>
    apiGet<MovimientoResponse[]>(`${BASE}/movimientos/presentacion/${idPresentacion}`),
};