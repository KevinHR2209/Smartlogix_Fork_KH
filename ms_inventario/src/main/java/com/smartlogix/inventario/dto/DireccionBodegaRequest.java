package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DireccionBodegaRequest {

    @NotNull(message = "La comuna es obligatoria")
    private Integer idComuna;

    @NotBlank(message = "La calle es obligatoria")
    private String calle;

    private String numero;
    private String detalle;
}