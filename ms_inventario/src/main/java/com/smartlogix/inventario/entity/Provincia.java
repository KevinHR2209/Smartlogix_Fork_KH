package com.smartlogix.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "provincia")
public class Provincia {

    @Id
    @Column(name = "id_provincia")
    private Integer idProvincia;   // ← sin @GeneratedValue, el ID viene del init.sql

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_region", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private Region region;

    @Column(name = "nombre_provincia", nullable = false, length = 100)
    private String nombreProvincia;
}