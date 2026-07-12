package com.smartlogix.msclientes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearClienteDesdeAuthRequest {

    @NotNull(message = "El id de usuario auth es obligatorio")
    private Long idUsuarioAuth;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido paterno es obligatorio")
    private String apellidoPaterno;

    @NotBlank(message = "El apellido materno es obligatorio")
    private String apellidoMaterno;

    @Email(message = "El correo debe tener formato válido")
    @NotBlank(message = "El correo es obligatorio")
    private String correo;

    @NotBlank(message = "El RUT es obligatorio")
    private String rut;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @Valid
    @NotNull(message = "La dirección principal es obligatoria")
    private DireccionPrincipalRequest direccionPrincipal;
}