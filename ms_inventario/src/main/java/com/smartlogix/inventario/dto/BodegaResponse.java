package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BodegaResponse {
    private Integer idBodega;
    private String nombre;
    private String direccionFisica;
}