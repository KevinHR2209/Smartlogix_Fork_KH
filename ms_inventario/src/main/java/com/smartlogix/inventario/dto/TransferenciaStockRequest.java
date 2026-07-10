package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransferenciaStockRequest {

    @NotNull
    private Long idProducto;

    @NotNull
    private Integer idBodegaOrigen;

    @NotNull
    private Integer idBodegaDestino;

    @NotNull
    @Min(1)
    private Integer cantidad;
}