package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BodegaRequest {

    @NotBlank(message = "El nombre de la bodega es obligatorio")
    private String nombre;

    @NotNull(message = "La dirección es obligatoria")
    private DireccionBodegaRequest direccion;

    private Boolean activa = true;
}