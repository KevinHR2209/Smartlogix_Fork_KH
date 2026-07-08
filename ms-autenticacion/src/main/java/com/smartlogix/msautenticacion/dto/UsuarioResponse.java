package com.smartlogix.msautenticacion.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponse {
    private Long idUsuario;
    private String nombre;
    private String correo;
    private String rol;
    private Boolean activo;
}