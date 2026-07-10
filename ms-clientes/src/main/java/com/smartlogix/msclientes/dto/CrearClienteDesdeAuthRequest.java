package com.smartlogix.msclientes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearClienteDesdeAuthRequest {

    @NotNull
    private Long idUsuarioAuth;

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellidoPaterno;

    @NotBlank
    private String apellidoMaterno;

    @Email
    @NotBlank
    private String correo;

    @NotBlank
    private String rut;

    @NotBlank
    private String telefono;

    @Valid
    @NotNull
    private DireccionPrincipalRequest direccionPrincipal;
}