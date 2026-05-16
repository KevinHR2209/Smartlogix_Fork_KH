package com.smartlogix.msventas.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPago;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    private Integer montoTransaccion;
    private String metodoPago;
    private String estadoPago;
    private OffsetDateTime fechaPago;
    private String tokenTransaccion;
}