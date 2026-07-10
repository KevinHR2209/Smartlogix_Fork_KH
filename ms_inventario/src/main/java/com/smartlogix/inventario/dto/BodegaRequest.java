package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BodegaRequest {
    @NotBlank
    private String nombre;

    @NotBlank
    private String direccionFisica;
}