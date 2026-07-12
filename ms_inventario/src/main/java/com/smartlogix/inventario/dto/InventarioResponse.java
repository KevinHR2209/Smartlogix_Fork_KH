package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class InventarioResponse {
    private Long idInventario;
    private Integer idBodega;
    private String nombreBodega;
    private Long idPresentacion;
    private Integer volumenMl;
    private String tipoEnvase;
    private BigDecimal precioActual;
    private Long idPerfume;
    private String nombrePerfume;
    private Integer stockDisponible;
    private Integer stockReservado;
    private Integer stockMinimo;
    private Boolean stockBajo;
    private OffsetDateTime ultimaActualizacion;
}