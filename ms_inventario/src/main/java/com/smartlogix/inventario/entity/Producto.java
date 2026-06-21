package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "sku", unique = true, length = 50)
    private String sku;

    @Column(name = "nombre", length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_actual")
    private Integer precioActual;

    @Column(name = "peso_gramos")
    private Integer pesoGramos;

    @Column(name = "dimensiones", length = 50)
    private String dimensiones;

    @Column(name = "estado", length = 50)
    private String estado;

    @Transient // Esto le dice a Hibernate: "No busques esta columna en la BD, es solo para el JSON"
        private Integer stockTotal;
}

    public Integer getStockTotal() { return stockTotal; }
    public void setStockTotal(Integer stockTotal) { this.stockTotal = stockTotal; }