package com.smartlogix.msautenticacion.dto;

import com.smartlogix.msautenticacion.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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

    private Rol rol;
}