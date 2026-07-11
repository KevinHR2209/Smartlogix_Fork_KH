package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "direccion_bodega")
public class DireccionBodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion_bodega")
    private Integer idDireccionBodega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comuna", nullable = false)
    @ToString.Exclude
    private Comuna comuna;

    @Column(name = "calle", nullable = false, length = 150)
    private String calle;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "detalle", length = 200)
    private String detalle;
}