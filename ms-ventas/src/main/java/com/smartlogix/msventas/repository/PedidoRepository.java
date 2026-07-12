package com.smartlogix.msventas.repository;

import com.smartlogix.msventas.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Busca pedidos por estado y anteriores a una fecha
    List<Pedido> findByEstadoPedidoAndFechaCreacionBefore(String estadoPedido, OffsetDateTime fecha);
}