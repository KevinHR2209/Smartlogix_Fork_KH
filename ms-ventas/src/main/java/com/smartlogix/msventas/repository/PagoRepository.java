package com.smartlogix.msventas.repository;

import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
}