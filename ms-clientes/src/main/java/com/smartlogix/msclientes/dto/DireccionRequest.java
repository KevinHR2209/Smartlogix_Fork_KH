package com.smartlogix.msclientes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DireccionRequest {

    @NotNull(message = "La comuna es obligatoria")
    private Integer idComuna;

    @NotBlank(message = "La calle es obligatoria")
    private String calle;

    @NotBlank(message = "El número es obligatorio")
    private String numero;

    private String detalle;

    private Boolean esPrincipal = false;
}