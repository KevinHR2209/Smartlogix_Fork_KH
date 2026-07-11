package com.smartlogix.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "perfume")
public class Perfume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfume")
    private Long idPerfume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_marca", nullable = false)
    @ToString.Exclude @JsonIgnore
    private Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_familia")
    @ToString.Exclude @JsonIgnore
    private FamiliaOlfativa familiaOlfativa;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "concentracion", length = 50)
    private String concentracion; // EDP, EDT, EDC, Parfum

    @Column(name = "genero", length = 20)
    private String genero; // Hombre, Mujer, Unisex

    @Column(name = "temporada", length = 30)
    private String temporada; // Verano, Invierno, Primavera, Otoño, Todo_anio

    @Column(name = "momento_uso", length = 20)
    private String momentoUso; // Dia, Noche, Dia_Noche

    @Column(name = "estado", length = 30)
    private String estado; // activo, descontinuado

    @OneToMany(mappedBy = "perfume", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @JsonIgnore
    private List<PresentacionPerfume> presentaciones;
}