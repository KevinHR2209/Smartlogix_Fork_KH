package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DireccionBodegaResponse {
    private Integer idDireccionBodega;
    private Integer idComuna;
    private String nombreComuna;
    private String nombreProvincia;
    private String nombreRegion;
    private String calle;
    private String numero;
    private String detalle;
}