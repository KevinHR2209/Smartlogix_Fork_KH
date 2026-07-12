package com.smartlogix.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "comuna")
public class Comuna {

    @Id
    @Column(name = "id_comuna")
    private Integer idComuna;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_provincia", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private Provincia provincia;

    @Column(name = "nombre_comuna", nullable = false, length = 100)
    private String nombreComuna;
}