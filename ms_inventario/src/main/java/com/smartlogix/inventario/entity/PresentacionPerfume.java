package com.smartlogix.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "presentacion_perfume")
public class PresentacionPerfume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presentacion")
    private Long idPresentacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfume", nullable = false)
    @ToString.Exclude @JsonIgnore
    private Perfume perfume;

    @Column(name = "sku", unique = true, nullable = false, length = 50)
    private String sku;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @Column(name = "volumen_ml", nullable = false)
    private Integer volumenMl;

    @Column(name = "tipo_envase", length = 50)
    private String tipoEnvase; // spray, roll-on, splash

    @Column(name = "precio_actual", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioActual;

    @Column(name = "peso_gramos")
    private Integer pesoGramos;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "activo")
    private Boolean activo = true;

    @OneToMany(mappedBy = "presentacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @JsonIgnore
    private List<Inventario> inventarios;
}