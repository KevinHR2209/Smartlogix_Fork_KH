package com.smartlogix.msclientes.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DireccionClienteResponse {

    private Long idDireccion;
    private String calle;
    private String numero;
    private String detalle;
    private Boolean esPrincipal;
    private Integer idComuna;
    private String nombreComuna;
    private Integer idProvincia;
    private String nombreProvincia;
    private Integer idRegion;
    private String nombreRegion;
    private String codigoRegion;
}