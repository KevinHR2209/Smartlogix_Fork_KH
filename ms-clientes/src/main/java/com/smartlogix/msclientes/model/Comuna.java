package com.smartlogix.msclientes.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comuna")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comuna {

    @Id
    @Column(name = "id_comuna")
    private Integer idComuna;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_provincia", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Provincia provincia;

    @Column(name = "nombre_comuna", nullable = false)
    private String nombreComuna;
}