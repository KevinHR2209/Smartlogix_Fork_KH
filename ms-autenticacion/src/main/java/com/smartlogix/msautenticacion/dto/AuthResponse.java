package com.smartlogix.msautenticacion.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tipo;
    private Long idUsuario;
    private String nombre;
    private String correo;
    private String rol;
}