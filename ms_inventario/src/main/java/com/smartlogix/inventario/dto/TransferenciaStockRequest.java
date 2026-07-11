package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransferenciaStockRequest {

    @NotNull(message = "La presentación es obligatoria")
    private Long idPresentacion;       // antes era idProducto

    @NotNull(message = "La bodega origen es obligatoria")
    private Integer idBodegaOrigen;

    @NotNull(message = "La bodega destino es obligatoria")
    private Integer idBodegaDestino;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;

    private String observacion;
    private String usuarioResponsable;
}