package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MarcaRequest {

    @NotBlank(message = "El nombre de la marca es obligatorio")
    private String nombre;

    private String paisOrigen;
}