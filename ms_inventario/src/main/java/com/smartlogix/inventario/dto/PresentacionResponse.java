package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PresentacionResponse {
    private Long idPresentacion;
    private Long idPerfume;
    private String nombrePerfume;
    private String skuPerfume;
    private String sku;
    private String codigoBarras;
    private Integer volumenMl;
    private String tipoEnvase;
    private BigDecimal precioActual;
    private Integer pesoGramos;
    private String imagenUrl;
    private Boolean activo;
}