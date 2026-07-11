package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "movimiento_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @Column(name = "tipo_movimiento", nullable = false, length = 30)
    private String tipoMovimiento; // ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_presentacion", nullable = false)
    @ToString.Exclude
    private PresentacionPerfume presentacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bodega_origen")
    @ToString.Exclude
    private Bodega bodegaOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bodega_destino")
    @ToString.Exclude
    private Bodega bodegaDestino;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "id_pedido")
    private Long idPedido; // referencia lógica a ms-ventas

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "fecha_movimiento")
    private OffsetDateTime fechaMovimiento = OffsetDateTime.now();

    @Column(name = "usuario_responsable", length = 100)
    private String usuarioResponsable;
}