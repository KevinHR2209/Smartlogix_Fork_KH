package com.smartlogix.msventas.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Respuesta de GET /api/clientes/{id}/direccion-principal en ms-clientes.
 *
 * OJO: ms-clientes serializa el nombre de la comuna como "nombreComuna",
 * no como "comuna". Sin el @JsonProperty de abajo, Jackson dejaba el campo
 * en null, y ese null llegaba hasta InventarioClient.descontarStock() como
 * regionDestino, donde ms-inventario no encontraba bodega y devolvia 404.
 * Eso hacia fallar TODO el procesamiento de un pago exitoso.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DireccionClienteResponse(
        String calle,
        String numero,
        String detalle,
        @JsonProperty("nombreComuna") String comuna
) {
    public String getDireccionCompleta() {
        return calle
                + " " + (numero != null ? numero : "")
                + " " + (detalle != null ? detalle : "");
    }
}