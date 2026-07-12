package com.smartlogix.mslogistica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DespachoRequest(
        @NotNull(message = "El id del pedido es obligatorio")
        Long idPedido,
        @NotBlank(message = "La dirección de entrega es obligatoria")
        String direccionEntrega,
        @NotBlank(message = "La comuna de entrega es obligatoria")
        String comunaEntrega,
        String estadoDespacho
) {}