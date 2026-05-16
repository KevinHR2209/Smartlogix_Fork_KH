package com.smartlogix.msclientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

    @Column(unique = true)
    private String rut;

    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;

    @Column(unique = true)
    private String correo;

    private String telefono;
}