package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PerfumeRequest {

    @NotNull(message = "La marca es obligatoria")
    private Integer idMarca;

    private Integer idFamilia;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;
    private String concentracion; // EDP, EDT, EDC, Parfum
    private String genero;        // Hombre, Mujer, Unisex
    private String temporada;     // Verano, Invierno, Primavera, Otoño, Todo_anio
    private String momentoUso;    // Dia, Noche, Dia_Noche
    private String estado;        // activo, descontinuado
}