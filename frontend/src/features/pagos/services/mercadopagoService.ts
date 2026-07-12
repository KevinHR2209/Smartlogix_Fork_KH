import { apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PreferenciaMercadoPago } from "../types/pago";

export const mercadopagoService = {
  // El body va vacio: el backend arma la preferencia a partir del pedido
  // ya creado (sus detalles, precios y monto ya estan calculados ahi).
  crearPreferencia: (idPedido: number) =>
    apiPost<PreferenciaMercadoPago>(endpoints.pagos.mercadopagoPreferencia(idPedido), {}),
};
