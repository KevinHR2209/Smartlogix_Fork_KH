package com.smartlogix.msventas.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "detalle_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;

    @JsonIgnore // 
    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @Column(name = "id_presentacion")
    private Long idPresentacion; // Reemplazamos idProducto

    private Integer cantidad;

    private Integer precioUnitarioSnapshot;
}