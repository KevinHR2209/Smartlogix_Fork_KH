package com.smartlogix.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PresentacionRequest {

    @NotNull(message = "El perfume es obligatorio")
    private Long idPerfume;

    @NotBlank(message = "El SKU es obligatorio")
    private String sku;

    private String codigoBarras;

    @NotNull(message = "El volumen es obligatorio")
    @Positive(message = "El volumen debe ser mayor a 0")
    private Integer volumenMl;

    private String tipoEnvase; // spray, roll-on, splash

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precioActual;

    private Integer pesoGramos;
    private String imagenUrl;
    private Boolean activo = true;
}