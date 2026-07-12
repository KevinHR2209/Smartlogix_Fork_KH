package com.smartlogix.msclientes.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClienteResponse {

    private Long idCliente;
    private Long idUsuarioAuth;
    private String rut;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String telefono;
    private List<DireccionClienteResponse> direcciones;
}