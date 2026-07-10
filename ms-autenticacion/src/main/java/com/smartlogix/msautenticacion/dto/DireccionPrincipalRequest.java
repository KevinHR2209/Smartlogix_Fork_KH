package com.smartlogix.msautenticacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DireccionPrincipalRequest {
    @NotNull
    private Integer idComuna;
    @NotBlank
    private String calle;
    @NotBlank
    private String numero;
    private String detalle;
}