package com.smartlogix.msclientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direccion_cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DireccionCliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDireccion;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    private Integer idComuna;
    private String calle;
    private String numero;
    private String detalle;
    private Boolean esPrincipal;
}