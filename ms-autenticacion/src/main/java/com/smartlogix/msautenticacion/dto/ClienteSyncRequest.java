package com.smartlogix.msautenticacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteSyncRequest {
    private Long idUsuarioAuth;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String rut;
    private String telefono;
    private DireccionPrincipalRequest direccionPrincipal;
}