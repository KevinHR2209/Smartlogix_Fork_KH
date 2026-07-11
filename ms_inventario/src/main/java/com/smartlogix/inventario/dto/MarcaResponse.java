package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarcaResponse {
    private Integer idMarca;
    private String nombre;
    private String paisOrigen;
}