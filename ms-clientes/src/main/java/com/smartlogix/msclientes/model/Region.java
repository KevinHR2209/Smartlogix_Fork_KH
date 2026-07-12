package com.smartlogix.msclientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "region")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region {

    @Id
    @Column(name = "id_region")
    private Integer idRegion;

    @Column(name = "codigo_region", unique = true)
    private String codigoRegion;

    @Column(name = "nombre_region", nullable = false)
    private String nombreRegion;
}