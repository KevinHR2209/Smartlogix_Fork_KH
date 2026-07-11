package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventarioRequest {

    @NotNull(message = "La bodega es obligatoria")
    private Integer idBodega;

    @NotNull(message = "La presentación es obligatoria")
    private Long idPresentacion;

    @Min(value = 0, message = "El stock disponible no puede ser negativo")
    private Integer stockDisponible = 0;

    @Min(value = 0, message = "El stock reservado no puede ser negativo")
    private Integer stockReservado = 0;

    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo = 5;
}