package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "inventario",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_bodega", "id_presentacion"}))
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario")
    private Long idInventario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bodega", nullable = false)
    @ToString.Exclude
    private Bodega bodega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_presentacion", nullable = false)
    @ToString.Exclude
    private PresentacionPerfume presentacion;

    @Column(name = "stock_disponible")
    private Integer stockDisponible = 0;

    @Column(name = "stock_reservado")
    private Integer stockReservado = 0;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 5;

    @Column(name = "ultima_actualizacion")
    private OffsetDateTime ultimaActualizacion = OffsetDateTime.now();
}