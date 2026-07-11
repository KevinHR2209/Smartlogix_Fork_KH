package com.smartlogix.inventario.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String mensaje;
    private OffsetDateTime timestamp;
    private Map<String, String> errores; // solo para errores de validación

    // Constructor para errores simples sin mapa de campos
    public ErrorResponse(int status, String mensaje, OffsetDateTime timestamp) {
        this.status = status;
        this.mensaje = mensaje;
        this.timestamp = timestamp;
    }
}