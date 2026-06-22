package com.smartlogix.msclientes.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    @Transient
    private String region;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonManagedReference
    private List<DireccionCliente> direcciones;
}