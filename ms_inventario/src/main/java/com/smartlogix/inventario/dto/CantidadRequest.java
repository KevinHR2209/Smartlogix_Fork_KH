package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CantidadRequest {

    @NotNull
    @Min(1)
    private Integer cantidad;
}