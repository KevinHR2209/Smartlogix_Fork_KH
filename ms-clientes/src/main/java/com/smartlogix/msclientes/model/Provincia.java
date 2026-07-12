package com.smartlogix.msclientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provincia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Provincia {

    @Id
    @Column(name = "id_provincia")
    private Integer idProvincia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_region", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Region region;

    @Column(name = "nombre_provincia", nullable = false)
    private String nombreProvincia;
}