// OJO: el backend (MercadoPagoDto.PreferenciaResponse) usa @JsonProperty
// para mapear el contrato de Mercado Pago, y esa misma anotacion aplica
// tambien a la SALIDA del endpoint (no solo a la entrada desde Mercado
// Pago). Por eso esta respuesta viene en snake_case, no camelCase como
// el resto de la API de ms-ventas.
export interface PreferenciaMercadoPago {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  external_reference: string;
}

// GET /api/pagos/mercadopago/estado/{idPedido} devuelve el modelo Pago tal
// cual (mismo shape que el resto de ms-ventas, camelCase normal).
export interface EstadoPago {
  idPago: number;
  montoTransaccion: number;
  metodoPago: string;
  estadoPago: string;
  fechaPago: string;
  tokenTransaccion: string;
}
