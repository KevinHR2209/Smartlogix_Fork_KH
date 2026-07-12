package com.smartlogix.msventas.repository;

import com.smartlogix.msventas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    Optional<Pago> findFirstByPedido_IdPedidoOrderByFechaPagoDesc(Long idPedido);

    Optional<Pago> findFirstByTokenTransaccionOrderByFechaPagoDesc(String tokenTransaccion);
}