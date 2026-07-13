import { apiGet, apiPost } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PreferenciaMercadoPago, EstadoPago } from "../types/pago";

export const mercadopagoService = {
  // El body va vacio: el backend arma la preferencia a partir del pedido
  // ya creado (sus detalles, precios y monto ya estan calculados ahi).
  crearPreferencia: (idPedido: number) =>
    apiPost<PreferenciaMercadoPago>(endpoints.pagos.mercadopagoPreferencia(idPedido), {}),

  consultarEstado: (idPedido: number) =>
    apiGet<EstadoPago>(endpoints.pagos.mercadopagoEstado(idPedido)),

  // Se llama desde la pagina /pago/exito con el payment_id que Mercado Pago
  // agrega como query param al redirigir de vuelta. El backend NO confia en
  // el navegador: consulta el pago real en la API de Mercado Pago antes de
  // marcar nada. Es idempotente (recargar la pagina no duplica nada).
  confirmarPago: (paymentId: string) =>
    apiPost<EstadoPago>(endpoints.pagos.mercadopagoConfirmar(paymentId), {}),
};
