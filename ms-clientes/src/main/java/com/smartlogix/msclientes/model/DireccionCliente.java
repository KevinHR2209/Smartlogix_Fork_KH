package com.smartlogix.msclientes.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @Column(name = "id_direccion")
    private Long idDireccion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", referencedColumnName = "id_cliente", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonBackReference
    private Cliente cliente;

    @Column(name = "id_comuna")
    private Integer idComuna;

    @Column(name = "calle")
    private String calle;

    @Column(name = "numero")
    private String numero;

    @Column(name = "detalle")
    private String detalle;

    @Column(name = "es_principal")
    private Boolean esPrincipal;
}