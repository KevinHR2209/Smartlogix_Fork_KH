package com.smartlogix.msautenticacion.dto;

import com.smartlogix.msautenticacion.model.Rol;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String nombre;

    @Email
    @NotBlank
    private String correo;

    @NotBlank
    private String password;

    @NotNull
    private Rol rol;

    @NotBlank
    private String rut;

    @NotBlank
    private String apellidoPaterno;

    @NotBlank
    private String apellidoMaterno;

    @NotBlank
    private String telefono;

    @Valid
    @NotNull
    private DireccionPrincipalRequest direccionPrincipal;
}