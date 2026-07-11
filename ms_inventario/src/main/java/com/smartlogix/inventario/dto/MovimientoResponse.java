package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class MovimientoResponse {
    private Long idMovimiento;
    private String tipoMovimiento;
    private Long idPresentacion;
    private String nombrePerfume;
    private Integer volumenMl;
    private Integer idBodegaOrigen;
    private String nombreBodegaOrigen;
    private Integer idBodegaDestino;
    private String nombreBodegaDestino;
    private Integer cantidad;
    private Long idPedido;
    private String observacion;
    private OffsetDateTime fechaMovimiento;
    private String usuarioResponsable;
}