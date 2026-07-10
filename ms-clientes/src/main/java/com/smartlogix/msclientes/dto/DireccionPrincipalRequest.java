package com.smartlogix.msclientes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DireccionPrincipalRequest {

    @NotNull
    private Integer idComuna;

    @NotBlank
    private String calle;

    @NotBlank
    private String numero;

    private String detalle;
}