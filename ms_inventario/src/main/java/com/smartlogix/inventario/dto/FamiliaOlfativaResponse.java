package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FamiliaOlfativaResponse {
    private Integer idFamilia;
    private String nombre;
    private String descripcion;
}