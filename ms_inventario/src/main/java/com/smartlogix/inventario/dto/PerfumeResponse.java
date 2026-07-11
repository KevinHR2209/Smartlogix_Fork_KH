package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PerfumeResponse {
    private Long idPerfume;
    private String nombre;
    private String descripcion;
    private String concentracion;
    private String genero;
    private String temporada;
    private String momentoUso;
    private String estado;
    private MarcaResponse marca;
    private FamiliaOlfativaResponse familiaOlfativa;
    private List<PresentacionResponse> presentaciones;
}