package com.smartlogix.mslogistica.dto;

public record WebhookCourierRequest(
        String codigoSeguimiento,
        String nuevoEstado, // ej: "EN_RUTA", "ENTREGADO", "EXTRAVIADO"
        String fechaActualizacion,
        String firmaSeguridad // Para validar que realmente es el courier quien envía esto
) {}