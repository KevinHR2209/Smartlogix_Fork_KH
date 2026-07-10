package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteStockRequest {

    @NotNull
    private Integer cantidad;
}