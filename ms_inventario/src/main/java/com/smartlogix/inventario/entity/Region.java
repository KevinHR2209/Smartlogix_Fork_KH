package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "region")
public class Region {

    @Id
    @Column(name = "id_region")
    private Integer idRegion;

    @Column(name = "codigo_region", unique = true, length = 10)
    private String codigoRegion;

    @Column(name = "nombre_region", nullable = false, length = 100)
    private String nombreRegion;
}