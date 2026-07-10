import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  CantidadRequest,
  Inventario,
  InventarioRequest,
  TransferenciaStockRequest,
} from "../types/inventario";

export const inventarioService = {
  getById: (idInventario: number) =>
    apiGet<Inventario>(`${endpoints.inventario}/${idInventario}`),

  getByProducto: (idProducto: number) =>
    apiGet<Inventario[]>(`${endpoints.inventario}/producto/${idProducto}`),

  getByBodega: (idBodega: number) =>
    apiGet<Inventario[]>(`${endpoints.inventario}/bodega/${idBodega}`),

  create: (payload: InventarioRequest) =>
    apiPost<Inventario>(endpoints.inventario, payload),

  ajustar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${endpoints.inventario}/${idInventario}/ajustar`, payload),

  reservar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${endpoints.inventario}/${idInventario}/reservar`, payload),

  liberar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${endpoints.inventario}/${idInventario}/liberar`, payload),

  descontar: (idInventario: number, payload: CantidadRequest) =>
    apiPut<Inventario>(`${endpoints.inventario}/${idInventario}/descontar`, payload),

  transferir: (payload: TransferenciaStockRequest) =>
    apiPut<void>(`${endpoints.inventario}/transferir`, payload),
};