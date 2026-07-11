package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FamiliaOlfativaRequest {

    @NotBlank(message = "El nombre de la familia olfativa es obligatorio")
    private String nombre;

    private String descripcion;
}