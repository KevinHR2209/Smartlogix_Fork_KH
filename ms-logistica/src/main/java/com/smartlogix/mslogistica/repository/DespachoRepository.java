package com.smartlogix.mslogistica.repository;

import com.smartlogix.mslogistica.model.Despacho;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DespachoRepository extends JpaRepository<Despacho, Long> {
    Optional<Despacho> findByIdPedido(Long idPedido);
    Optional<Despacho> findByCodigoSeguimiento(String codigoSeguimiento);
}