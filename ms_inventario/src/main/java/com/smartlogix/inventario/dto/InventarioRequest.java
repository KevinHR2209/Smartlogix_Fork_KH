package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventarioRequest {

    @NotNull
    private Integer idBodega;

    @NotNull
    private Long idProducto;

    @NotNull
    @Min(0)
    private Integer stockDisponible;

    @NotNull
    @Min(0)
    private Integer stockReservado;
}