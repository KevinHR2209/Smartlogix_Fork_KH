package com.smartlogix.mslogistica.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class DespachoResponse {
    private Long idDespacho;
    private Long idPedido;
    private String direccionEntrega;
    private String comunaEntrega;
    private String estadoDespacho;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaEntregaEstimada;

    // ── CAMPOS COURIER ────────────────────────────────────────────────────────
    private String courier;
    private String codigoSeguimiento;
    private String urlSeguimiento;
}