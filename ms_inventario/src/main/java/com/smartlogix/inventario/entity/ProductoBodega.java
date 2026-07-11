package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "producto_bodega")
public class ProductoBodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario")
    private Long idInventario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bodega", referencedColumnName = "id_bodega")
    @ToString.Exclude
    private Bodega bodega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", referencedColumnName = "id_producto")
    @ToString.Exclude
    private Perfume producto;

    @Column(name = "stock_disponible")
    private Integer stockDisponible;

    @Column(name = "stock_reservado")
    private Integer stockReservado;
}