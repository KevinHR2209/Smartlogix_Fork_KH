package com.smartlogix.msventas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PedidoRequest(
        @NotNull(message = "El id del cliente es obligatorio")
        Long idCliente,

        @NotEmpty(message = "El pedido debe tener al menos un detalle")
        @Valid
        List<DetallePedidoRequest> detalles
) {}