package com.smartlogix.msventas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DetallePedidoRequest(
        @NotNull(message = "El id de la presentación es obligatorio")
        Long idPresentacion,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        Integer cantidad
) {}