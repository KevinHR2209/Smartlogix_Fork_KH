package com.smartlogix.inventario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventarioResponse {
    private Long idInventario;
    private Integer idBodega;
    private String nombreBodega;
    private Long idProducto;
    private String sku;
    private String nombreProducto;
    private Integer stockDisponible;
    private Integer stockReservado;
}