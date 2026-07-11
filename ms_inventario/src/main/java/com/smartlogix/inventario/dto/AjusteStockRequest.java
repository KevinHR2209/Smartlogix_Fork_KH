package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteStockRequest {

    @NotNull(message = "La cantidad es obligatoria")
    private Integer cantidad; // positivo = entrada, negativo = salida
}